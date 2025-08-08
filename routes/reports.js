const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Report = require('../models/Report');
const User = require('../models/User');
const Alert = require('../models/Alert');
const AccessLog = require('../models/Accesslog');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/reports
// @desc    Get all reports with pagination
// @access  Private (requires reports.read permission)
router.get('/', [
  auth,
  authorize('reports.read'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['access', 'compliance', 'security', 'attendance', 'system', 'custom']),
  query('status').optional().isIn(['generating', 'ready', 'failed', 'expired'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 10,
      type,
      status
    } = req.query;

    // Build filter object
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get reports with pagination
    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate('generatedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Report.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    logger.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/reports/:id
// @desc    Get report by ID
// @access  Private (requires reports.read permission)
router.get('/:id', [
  auth,
  authorize('reports.read')
], async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('generatedBy', 'firstName lastName email department');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    logger.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/reports/generate
// @desc    Generate new report
// @access  Private (requires reports.generate permission)
router.post('/generate', [
  auth,
  authorize('reports.generate'),
  body('name').trim().isLength({ min: 3, max: 200 }),
  body('type').isIn(['access', 'compliance', 'security', 'attendance', 'system', 'custom']),
  body('dateRange.start').isISO8601(),
  body('dateRange.end').isISO8601(),
  body('format').optional().isIn(['pdf', 'csv', 'excel', 'json'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      type,
      dateRange,
      format = 'pdf',
      filters = {},
      description
    } = req.body;

    // Validate date range
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }

    // Create report record
    const report = await Report.create({
      name,
      type,
      description,
      dateRange: {
        start: startDate,
        end: endDate
      },
      generatedBy: req.user.id,
      format,
      filters
    });

    // Generate report data asynchronously
    generateReportData(report._id, type, startDate, endDate, filters);

    logger.info(`Report generation started: ${name} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Report generation started',
      data: report
    });

  } catch (error) {
    logger.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/reports/:id/download
// @desc    Download report file
// @access  Private (requires reports.read permission)
router.get('/:id/download', [
  auth,
  authorize('reports.read')
], async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (report.status !== 'ready') {
      return res.status(400).json({
        success: false,
        message: 'Report is not ready for download'
      });
    }

    // Increment download count
    await report.incrementDownload();

    // In a real implementation, you would serve the actual file
    // For now, return the report data as JSON
    res.json({
      success: true,
      message: 'Report downloaded successfully',
      data: report.data || { message: 'Report data would be here' }
    });

    logger.info(`Report downloaded: ${report.name} by ${req.user.email}`);

  } catch (error) {
    logger.error('Download report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/reports/:id
// @desc    Delete report
// @access  Private (requires reports.delete permission)
router.delete('/:id', [
  auth,
  authorize('reports.delete')
], async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user owns the report or has admin privileges
    if (report.generatedBy.toString() !== req.user.id && !req.user.permissions.includes('reports.manage')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this report'
      });
    }

    await Report.findByIdAndDelete(req.params.id);

    logger.info(`Report deleted: ${report.name} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    logger.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Async function to generate report data
async function generateReportData(reportId, type, startDate, endDate, filters) {
  try {
    const report = await Report.findById(reportId);
    if (!report) return;

    let data = {};

    switch (type) {
      case 'access':
        data = await generateAccessReport(startDate, endDate, filters);
        break;
      case 'security':
        data = await generateSecurityReport(startDate, endDate, filters);
        break;
      case 'compliance':
        data = await generateComplianceReport(startDate, endDate, filters);
        break;
      case 'attendance':
        data = await generateAttendanceReport(startDate, endDate, filters);
        break;
      default:
        data = { message: 'Report type not implemented' };
    }

    // Update report with generated data
    report.status = 'ready';
    report.data = data;
    report.fileSize = JSON.stringify(data).length;
    await report.save();

    logger.info(`Report generated successfully: ${report.name}`);

  } catch (error) {
    logger.error('Report generation error:', error);
    
    // Update report status to failed
    await Report.findByIdAndUpdate(reportId, {
      status: 'failed',
      error: error.message
    });
  }
}

// Generate access report data
async function generateAccessReport(startDate, endDate, filters) {
  const accessLogs = await AccessLog.find({
    createdAt: { $gte: startDate, $lte: endDate }
  }).populate('user', 'firstName lastName department badgeNumber');

  const summary = {
    totalEntries: accessLogs.filter(log => log.action === 'entry' && log.success).length,
    totalExits: accessLogs.filter(log => log.action === 'exit' && log.success).length,
    failedAttempts: accessLogs.filter(log => !log.success).length,
    uniqueUsers: [...new Set(accessLogs.map(log => log.user?._id?.toString()))].length
  };

  return {
    summary,
    logs: accessLogs.slice(0, 1000), // Limit for performance
    generatedAt: new Date()
  };
}

// Generate security report data
async function generateSecurityReport(startDate, endDate, filters) {
  const alerts = await Alert.find({
    createdAt: { $gte: startDate, $lte: endDate }
  }).populate('assignedTo acknowledgedBy resolvedBy', 'firstName lastName');

  const summary = {
    totalAlerts: alerts.length,
    criticalAlerts: alerts.filter(alert => alert.severity === 'critical').length,
    resolvedAlerts: alerts.filter(alert => alert.status === 'resolved').length,
    averageResolutionTime: calculateAverageResolutionTime(alerts)
  };

  return {
    summary,
    alerts: alerts.slice(0, 1000),
    generatedAt: new Date()
  };
}

// Generate compliance report data
async function generateComplianceReport(startDate, endDate, filters) {
  const users = await User.find({ isActive: true }).populate('role');
  const alerts = await Alert.find({
    type: 'compliance',
    createdAt: { $gte: startDate, $lte: endDate }
  });

  const summary = {
    totalUsers: users.length,
    activeUsers: users.filter(user => user.isActive).length,
    complianceAlerts: alerts.length,
    complianceScore: calculateComplianceScore(users, alerts)
  };

  return {
    summary,
    users: users.slice(0, 1000),
    alerts: alerts.slice(0, 1000),
    generatedAt: new Date()
  };
}

// Generate attendance report data
async function generateAttendanceReport(startDate, endDate, filters) {
  const accessLogs = await AccessLog.find({
    action: { $in: ['entry', 'exit'] },
    success: true,
    createdAt: { $gte: startDate, $lte: endDate }
  }).populate('user', 'firstName lastName department');

  // Group by user and calculate attendance
  const attendanceData = {};
  accessLogs.forEach(log => {
    const userId = log.user?._id?.toString();
    if (!userId) return;

    if (!attendanceData[userId]) {
      attendanceData[userId] = {
        user: log.user,
        entries: [],
        exits: [],
        totalHours: 0
      };
    }

    if (log.action === 'entry') {
      attendanceData[userId].entries.push(log.createdAt);
    } else {
      attendanceData[userId].exits.push(log.createdAt);
    }
  });

  return {
    summary: {
      totalUsers: Object.keys(attendanceData).length,
      dateRange: { startDate, endDate }
    },
    attendance: Object.values(attendanceData).slice(0, 1000),
    generatedAt: new Date()
  };
}

// Helper functions
function calculateAverageResolutionTime(alerts) {
  const resolvedAlerts = alerts.filter(alert => alert.resolvedAt);
  if (resolvedAlerts.length === 0) return 0;

  const totalTime = resolvedAlerts.reduce((sum, alert) => {
    return sum + (alert.resolvedAt - alert.createdAt);
  }, 0);

  return Math.round(totalTime / resolvedAlerts.length / (1000 * 60 * 60)); // Hours
}

function calculateComplianceScore(users, alerts) {
  // Simple compliance score calculation
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.isActive).length;
  const complianceIssues = alerts.length;
  
  const baseScore = (activeUsers / totalUsers) * 100;
  const penalty = Math.min(complianceIssues * 2, 20); // Max 20% penalty
  
  return Math.max(baseScore - penalty, 0);
}

module.exports = router;
