const express = require('express');
const Alert = require('../models/Alert');
const User = require('../models/User');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Get alert reports
// @route   GET /api/reports/alerts
// @access  Private (Admin/Security Manager)
router.get('/alerts', [auth, authorize('admin', 'security_manager')], async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      department,
      severity,
      type,
      status,
      groupBy = 'day'
    } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      dateFilter.createdAt = { $gte: thirtyDaysAgo };
    }

    // Build additional filters
    const additionalFilters = {};
    if (department) additionalFilters.department = department;
    if (severity) additionalFilters.severity = severity;
    if (type) additionalFilters.type = type;
    if (status) additionalFilters.status = status;

    const matchFilter = { ...dateFilter, ...additionalFilters };

    // Group by configuration
    let groupId;
    switch (groupBy) {
      case 'hour':
        groupId = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          hour: { $hour: '$createdAt' }
        };
        break;
      case 'week':
        groupId = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'month':
        groupId = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      default: // day
        groupId = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }

    const [
      alertTrends,
      severityBreakdown,
      statusBreakdown,
      typeBreakdown,
      departmentBreakdown,
      totalStats
    ] = await Promise.all([
      Alert.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: groupId,
            count: { $sum: 1 },
            critical: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } },
            high: { $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] } },
            medium: { $sum: { $cond: [{ $eq: ['$severity', 'medium'] }, 1, 0] } },
            low: { $sum: { $cond: [{ $eq: ['$severity', 'low'] }, 1, 0] } }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
      ]),
      Alert.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      Alert.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Alert.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Alert.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Alert.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            avgResponseTime: {
              $avg: {
                $cond: [
                  { $ne: ['$resolvedAt', null] },
                  { $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 1000 * 60 * 60] },
                  null
                ]
              }
            },
            resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
            urgent: { $sum: { $cond: ['$isUrgent', 1, 0] } }
          }
        }
      ])
    ]);

    const stats = totalStats[0] || { total: 0, avgResponseTime: 0, resolved: 0, urgent: 0 };
    const resolutionRate = stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalAlerts: stats.total,
          resolvedAlerts: stats.resolved,
          urgentAlerts: stats.urgent,
          averageResponseTime: Math.round(stats.avgResponseTime || 0),
          resolutionRate: Math.round(resolutionRate)
        },
        trends: alertTrends,
        breakdowns: {
          severity: severityBreakdown.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          status: statusBreakdown.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          type: typeBreakdown,
          department: departmentBreakdown
        },
        filters: {
          startDate: startDate || thirtyDaysAgo.toISOString(),
          endDate: endDate || new Date().toISOString(),
          department,
          severity,
          type,
          status,
          groupBy
        }
      }
    });
  } catch (error) {
    logger.error('Get alert reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user reports
// @route   GET /api/reports/users
// @access  Private (Admin only)
router.get('/users', [auth, authorize('admin')], async (req, res) => {
  try {
    const {
      department,
      role,
      isActive,
      startDate,
      endDate
    } = req.query;

    // Build filter
    const filter = {};
    if (department) filter.department = department;
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    // Date range for user creation
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const [
      totalUsers,
      usersByDepartment,
      usersByRole,
      usersByStatus,
      recentUsers,
      userGrowth
    ] = await Promise.all([
      User.countDocuments(filter),
      User.aggregate([
        { $match: filter },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      User.aggregate([
        { $match: filter },
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$isActive',
            count: { $sum: 1 }
          }
        }
      ]),
      User.find(filter)
        .select('name email employeeId department role isActive createdAt')
        .sort({ createdAt: -1 })
        .limit(10),
      User.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalUsers,
          activeUsers: usersByStatus.find(s => s._id === true)?.count || 0,
          inactiveUsers: usersByStatus.find(s => s._id === false)?.count || 0
        },
        breakdowns: {
          department: usersByDepartment,
          role: usersByRole.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          status: {
            active: usersByStatus.find(s => s._id === true)?.count || 0,
            inactive: usersByStatus.find(s => s._id === false)?.count || 0
          }
        },
        growth: userGrowth,
        recentUsers,
        filters: {
          department,
          role,
          isActive,
          startDate,
          endDate
        }
      }
    });
  } catch (error) {
    logger.error('Get user reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get performance metrics
// @route   GET /api/reports/performance
// @access  Private (Admin/Security Manager)
router.get('/performance', [auth, authorize('admin', 'security_manager')], async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const [
      responseMetrics,
      volumeMetrics,
      userMetrics,
      systemMetrics
    ] = await Promise.all([
      Alert.aggregate([
        {
          $match: {
            resolvedAt: { $exists: true },
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $addFields: {
            responseTime: {
              $divide: [
                { $subtract: ['$resolvedAt', '$createdAt'] },
                1000 * 60 * 60 // Convert to hours
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            avgResponseTime: { $avg: '$responseTime' },
            minResponseTime: { $min: '$responseTime' },
            maxResponseTime: { $max: '$responseTime' },
            totalResolved: { $sum: 1 }
          }
        }
      ]),
      Alert.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalAlerts: { $sum: 1 },
            criticalAlerts: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } },
            urgentAlerts: { $sum: { $cond: ['$isUrgent', 1, 0] } },
            avgPerDay: { $avg: 1 }
          }
        }
      ]),
      User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
            adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
            securityUsers: { 
              $sum: { 
                $cond: [
                  { $in: ['$role', ['security_manager', 'security_guard']] }, 
                  1, 
                  0
                ] 
              } 
            }
          }
        }
      ]),
      Alert.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ])
    ]);

    const response = responseMetrics[0] || {
      avgResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      totalResolved: 0
    };

    const volume = volumeMetrics[0] || {
      totalAlerts: 0,
      criticalAlerts: 0,
      urgentAlerts: 0,
      avgPerDay: 0
    };

    const users = userMetrics[0] || {
      totalUsers: 0,
      activeUsers: 0,
      adminUsers: 0,
      securityUsers: 0
    };

    res.json({
      success: true,
      data: {
        responseTime: {
          average: Math.round(response.avgResponseTime || 0),
          minimum: Math.round(response.minResponseTime || 0),
          maximum: Math.round(response.maxResponseTime || 0),
          totalResolved: response.totalResolved
        },
        volume: {
          totalAlerts: volume.totalAlerts,
          criticalAlerts: volume.criticalAlerts,
          urgentAlerts: volume.urgentAlerts,
          averagePerDay: Math.round(volume.totalAlerts / days)
        },
        users: {
          total: users.totalUsers,
          active: users.activeUsers,
          admins: users.adminUsers,
          security: users.securityUsers,
          utilization: users.totalUsers > 0 ? Math.round((users.activeUsers / users.totalUsers) * 100) : 0
        },
        trends: systemMetrics,
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          days
        }
      }
    });
  } catch (error) {
    logger.error('Get performance metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Export report data
// @route   GET /api/reports/export
// @access  Private (Admin/Security Manager)
router.get('/export', [auth, authorize('admin', 'security_manager')], async (req, res) => {
  try {
    const {
      type = 'alerts',
      format = 'json',
      startDate,
      endDate,
      ...filters
    } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    let data = [];
    let filename = '';

    switch (type) {
      case 'alerts':
        const alertFilter = { ...dateFilter };
        Object.keys(filters).forEach(key => {
          if (filters[key]) alertFilter[key] = filters[key];
        });

        data = await Alert.find(alertFilter)
          .populate('reportedBy assignedTo resolvedBy', 'name email employeeId')
          .sort({ createdAt: -1 });
        
        filename = `alerts-export-${Date.now()}`;
        break;

      case 'users':
        const userFilter = { ...filters };
        if (userFilter.isActive !== undefined) {
          userFilter.isActive = userFilter.isActive === 'true';
        }

        data = await User.find(userFilter)
          .select('-password')
          .sort({ createdAt: -1 });
        
        filename = `users-export-${Date.now()}`;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }

    // Set appropriate headers
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      
      // Simple CSV conversion (in production, use a proper CSV library)
      if (data.length > 0) {
        const headers = Object.keys(data[0].toObject()).join(',');
        const rows = data.map(item => Object.values(item.toObject()).join(',')).join('\n');
        res.send(`${headers}\n${rows}`);
      } else {
        res.send('No data available');
      }
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      res.json({
        success: true,
        exportedAt: new Date().toISOString(),
        recordCount: data.length,
        data
      });
    }
  } catch (error) {
    logger.error('Export report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;