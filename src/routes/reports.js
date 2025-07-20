const express = require('express');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');
const AccessLog = require('../models/AccessLog');
const Alert = require('../models/Alert');
const User = require('../models/User');
const Floor = require('../models/Floor');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Generate access report
// @route   GET /api/reports/access
// @access  Private (HR/Admin/Security only)
router.get('/access', protect, authorize('admin', 'hr', 'security'), async (req, res) => {
  try {
    const { startDate, endDate, format = 'json', userId, floorId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    // Build query
    let query = {
      timestamp: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (userId) query.user = userId;
    if (floorId) query.floor = floorId;

    const accessLogs = await AccessLog.find(query)
      .populate('user', 'name employeeId department')
      .populate('floor', 'name level securityLevel')
      .sort({ timestamp: -1 });

    // Generate statistics
    const stats = {
      totalAccess: accessLogs.length,
      violations: accessLogs.filter(log => !log.isAuthorized).length,
      uniqueUsers: [...new Set(accessLogs.map(log => log.user._id.toString()))].length,
      accessByFloor: {},
      accessByHour: {},
      violationTypes: {}
    };

    // Calculate statistics
    accessLogs.forEach(log => {
      const floorName = log.floor.name;
      const hour = new Date(log.timestamp).getHours();
      
      stats.accessByFloor[floorName] = (stats.accessByFloor[floorName] || 0) + 1;
      stats.accessByHour[hour] = (stats.accessByHour[hour] || 0) + 1;
      
      if (!log.isAuthorized && log.violationType) {
        stats.violationTypes[log.violationType] = (stats.violationTypes[log.violationType] || 0) + 1;
      }
    });

    if (format === 'csv') {
      const fields = [
        'timestamp',
        'user.name',
        'user.employeeId',
        'user.department',
        'floor.name',
        'floor.level',
        'accessType',
        'accessMethod',
        'isAuthorized',
        'violationType'
      ];

      const parser = new Parser({ fields });
      const csv = parser.parse(accessLogs);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=access-report-${startDate}-to-${endDate}.csv`);
      return res.send(csv);
    }

    if (format === 'pdf') {
      const doc = new PDFDocument();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=access-report-${startDate}-to-${endDate}.pdf`);
      
      doc.pipe(res);

      // PDF Header
      doc.fontSize(20).text('WorkGuard360 Access Report', 50, 50);
      doc.fontSize(12).text(`Period: ${startDate} to ${endDate}`, 50, 80);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 50, 100);

      // Statistics
      doc.fontSize(16).text('Summary Statistics', 50, 140);
      doc.fontSize(12)
        .text(`Total Access Events: ${stats.totalAccess}`, 50, 170)
        .text(`Security Violations: ${stats.violations}`, 50, 190)
        .text(`Unique Users: ${stats.uniqueUsers}`, 50, 210);

      // Recent violations
      const violations = accessLogs.filter(log => !log.isAuthorized).slice(0, 10);
      if (violations.length > 0) {
        doc.fontSize(16).text('Recent Violations', 50, 250);
        let yPos = 280;
        
        violations.forEach(violation => {
          doc.fontSize(10)
            .text(`${violation.timestamp.toLocaleString()} - ${violation.user.name} (${violation.user.employeeId})`, 50, yPos)
            .text(`Floor: ${violation.floor.name}, Type: ${violation.violationType}`, 70, yPos + 15);
          yPos += 40;
        });
      }

      doc.end();
      return;
    }

    res.json({
      success: true,
      data: {
        accessLogs,
        statistics: stats,
        period: { startDate, endDate }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating access report',
      error: error.message
    });
  }
});

// @desc    Generate security report
// @route   GET /api/reports/security
// @access  Private (Admin/Security only)
router.get('/security', protect, authorize('admin', 'security'), async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const dateQuery = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    const [alerts, violations, criticalEvents] = await Promise.all([
      Alert.find(dateQuery)
        .populate('relatedUser', 'name employeeId department')
        .populate('relatedFloor', 'name level')
        .sort({ createdAt: -1 }),
      
      AccessLog.find({
        timestamp: dateQuery.createdAt,
        isAuthorized: false
      })
        .populate('user', 'name employeeId department')
        .populate('floor', 'name level')
        .sort({ timestamp: -1 }),
      
      Alert.find({
        ...dateQuery,
        severity: { $in: ['high', 'critical'] }
      })
        .populate('relatedUser', 'name employeeId')
        .sort({ createdAt: -1 })
    ]);

    const stats = {
      totalAlerts: alerts.length,
      totalViolations: violations.length,
      criticalEvents: criticalEvents.length,
      alertsByType: {},
      alertsBySeverity: {},
      violationsByType: {},
      responseTime: {
        average: 0,
        fastest: null,
        slowest: null
      }
    };

    // Calculate alert statistics
    alerts.forEach(alert => {
      stats.alertsByType[alert.type] = (stats.alertsByType[alert.type] || 0) + 1;
      stats.alertsBySeverity[alert.severity] = (stats.alertsBySeverity[alert.severity] || 0) + 1;
    });

    // Calculate violation statistics
    violations.forEach(violation => {
      if (violation.violationType) {
        stats.violationsByType[violation.violationType] = (stats.violationsByType[violation.violationType] || 0) + 1;
      }
    });

    // Calculate response times
    const acknowledgedAlerts = alerts.filter(alert => alert.acknowledgedAt);
    if (acknowledgedAlerts.length > 0) {
      const responseTimes = acknowledgedAlerts.map(alert => 
        alert.acknowledgedAt - alert.createdAt
      );
      
      stats.responseTime.average = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      stats.responseTime.fastest = Math.min(...responseTimes);
      stats.responseTime.slowest = Math.max(...responseTimes);
    }

    if (format === 'pdf') {
      const doc = new PDFDocument();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=security-report-${startDate}-to-${endDate}.pdf`);
      
      doc.pipe(res);

      // PDF Header
      doc.fontSize(20).text('WorkGuard360 Security Report', 50, 50);
      doc.fontSize(12).text(`Period: ${startDate} to ${endDate}`, 50, 80);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 50, 100);

      // Security Overview
      doc.fontSize(16).text('Security Overview', 50, 140);
      doc.fontSize(12)
        .text(`Total Alerts: ${stats.totalAlerts}`, 50, 170)
        .text(`Security Violations: ${stats.totalViolations}`, 50, 190)
        .text(`Critical Events: ${stats.criticalEvents}`, 50, 210);

      if (stats.responseTime.average > 0) {
        doc.text(`Average Response Time: ${Math.round(stats.responseTime.average / 1000 / 60)} minutes`, 50, 230);
      }

      // Critical Events
      if (criticalEvents.length > 0) {
        doc.fontSize(16).text('Critical Events', 50, 270);
        let yPos = 300;
        
        criticalEvents.slice(0, 5).forEach(event => {
          doc.fontSize(10)
            .text(`${event.createdAt.toLocaleString()} - ${event.title}`, 50, yPos)
            .text(`Severity: ${event.severity.toUpperCase()}`, 70, yPos + 15);
          yPos += 40;
        });
      }

      doc.end();
      return;
    }

    res.json({
      success: true,
      data: {
        alerts,
        violations,
        criticalEvents,
        statistics: stats,
        period: { startDate, endDate }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating security report',
      error: error.message
    });
  }
});

// @desc    Generate user activity report
// @route   GET /api/reports/user-activity/:userId
// @access  Private (HR/Admin only)
router.get('/user-activity/:userId', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, format = 'json' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const user = await User.findById(userId)
      .populate('shift', 'name startTime endTime')
      .populate('authorizedFloors', 'name level');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const accessLogs = await AccessLog.find({
      user: userId,
      timestamp: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
      .populate('floor', 'name level securityLevel')
      .sort({ timestamp: -1 });

    const stats = {
      totalAccess: accessLogs.length,
      violations: accessLogs.filter(log => !log.isAuthorized).length,
      floorsAccessed: [...new Set(accessLogs.map(log => log.floor.name))],
      accessByDay: {},
      accessByHour: {}
    };

    // Calculate daily and hourly patterns
    accessLogs.forEach(log => {
      const day = log.timestamp.toDateString();
      const hour = log.timestamp.getHours();
      
      stats.accessByDay[day] = (stats.accessByDay[day] || 0) + 1;
      stats.accessByHour[hour] = (stats.accessByHour[hour] || 0) + 1;
    });

    if (format === 'csv') {
      const fields = [
        'timestamp',
        'floor.name',
        'floor.level',
        'accessType',
        'accessMethod',
        'isAuthorized',
        'violationType'
      ];

      const parser = new Parser({ fields });
      const csv = parser.parse(accessLogs);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=user-activity-${user.employeeId}-${startDate}-to-${endDate}.csv`);
      return res.send(csv);
    }

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile(),
        accessLogs,
        statistics: stats,
        period: { startDate, endDate }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating user activity report',
      error: error.message
    });
  }
});

// @desc    Generate compliance report
// @route   GET /api/reports/compliance
// @access  Private (Admin only)
router.get('/compliance', protect, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const dateQuery = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };

    const [
      totalUsers,
      activeUsers,
      totalAccess,
      violations,
      resolvedAlerts,
      pendingAlerts
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      AccessLog.countDocuments({ timestamp: dateQuery }),
      AccessLog.countDocuments({ 
        timestamp: dateQuery,
        isAuthorized: false 
      }),
      Alert.countDocuments({
        createdAt: dateQuery,
        status: 'resolved'
      }),
      Alert.countDocuments({
        createdAt: dateQuery,
        status: { $in: ['active', 'acknowledged'] }
      })
    ]);

    const complianceScore = violations > 0 ? 
      Math.max(0, 100 - (violations / totalAccess * 100)) : 100;

    const report = {
      period: { startDate, endDate },
      overview: {
        totalUsers,
        activeUsers,
        totalAccess,
        violations,
        complianceScore: Math.round(complianceScore * 100) / 100
      },
      alerts: {
        resolved: resolvedAlerts,
        pending: pendingAlerts,
        resolutionRate: resolvedAlerts + pendingAlerts > 0 ? 
          Math.round((resolvedAlerts / (resolvedAlerts + pendingAlerts)) * 100) : 0
      }
    };

    if (format === 'pdf') {
      const doc = new PDFDocument();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=compliance-report-${startDate}-to-${endDate}.pdf`);
      
      doc.pipe(res);

      // PDF Header
      doc.fontSize(20).text('WorkGuard360 Compliance Report', 50, 50);
      doc.fontSize(12).text(`Period: ${startDate} to ${endDate}`, 50, 80);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 50, 100);

      // Compliance Overview
      doc.fontSize(16).text('Compliance Overview', 50, 140);
      doc.fontSize(12)
        .text(`Compliance Score: ${report.overview.complianceScore}%`, 50, 170)
        .text(`Total Access Events: ${report.overview.totalAccess}`, 50, 190)
        .text(`Security Violations: ${report.overview.violations}`, 50, 210)
        .text(`Active Users: ${report.overview.activeUsers}`, 50, 230);

      // Alert Management
      doc.fontSize(16).text('Alert Management', 50, 270);
      doc.fontSize(12)
        .text(`Resolved Alerts: ${report.alerts.resolved}`, 50, 300)
        .text(`Pending Alerts: ${report.alerts.pending}`, 50, 320)
        .text(`Resolution Rate: ${report.alerts.resolutionRate}%`, 50, 340);

      doc.end();
      return;
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating compliance report',
      error: error.message
    });
  }
});

module.exports = router;