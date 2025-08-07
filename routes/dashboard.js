const express = require('express');
const Alert = require('../models/Alert');
const User = require('../models/User');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalAlerts,
      activeAlerts,
      resolvedAlerts,
      criticalAlerts,
      todayAlerts,
      weeklyAlerts,
      monthlyAlerts,
      totalUsers,
      activeUsers,
      alertsByDepartment,
      recentActivity
    ] = await Promise.all([
      Alert.countDocuments(),
      Alert.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
      Alert.countDocuments({ status: 'resolved' }),
      Alert.countDocuments({ severity: 'critical', status: { $in: ['open', 'in_progress'] } }),
      Alert.countDocuments({ createdAt: { $gte: today } }),
      Alert.countDocuments({ createdAt: { $gte: thisWeek } }),
      Alert.countDocuments({ createdAt: { $gte: thisMonth } }),
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Alert.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Alert.find()
        .populate('reportedBy', 'name employeeId')
        .select('title type severity status createdAt')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    // Calculate trends
    const previousWeek = new Date(thisWeek.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previousWeekAlerts = await Alert.countDocuments({
      createdAt: { $gte: previousWeek, $lt: thisWeek }
    });

    const weeklyTrend = previousWeekAlerts > 0 
      ? ((weeklyAlerts - previousWeekAlerts) / previousWeekAlerts) * 100 
      : 100;

    res.json({
      success: true,
      data: {
        overview: {
          totalAlerts,
          activeAlerts,
          resolvedAlerts,
          criticalAlerts,
          resolutionRate: totalAlerts > 0 ? Math.round((resolvedAlerts / totalAlerts) * 100) : 0
        },
        trends: {
          todayAlerts,
          weeklyAlerts,
          monthlyAlerts,
          weeklyTrend: Math.round(weeklyTrend)
        },
        users: {
          totalUsers,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers
        },
        alertsByDepartment: alertsByDepartment.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recentActivity
      }
    });
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get dashboard charts data
// @route   GET /api/dashboard/charts
// @access  Private
router.get('/charts', auth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    // Alerts by day
    const alertsByDay = await Alert.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
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
    ]);

    // Alerts by severity
    const alertsBySeverity = await Alert.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);

    // Alerts by status
    const alertsByStatus = await Alert.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Response time analysis
    const responseTimeData = await Alert.aggregate([
      {
        $match: {
          resolvedAt: { $exists: true },
          createdAt: { $gte: startDate }
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
          maxResponseTime: { $max: '$responseTime' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        alertsByDay,
        alertsBySeverity: alertsBySeverity.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        alertsByStatus: alertsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        responseTime: responseTimeData[0] || {
          avgResponseTime: 0,
          minResponseTime: 0,
          maxResponseTime: 0
        }
      }
    });
  } catch (error) {
    logger.error('Get dashboard charts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get recent activities
// @route   GET /api/dashboard/activities
// @access  Private
router.get('/activities', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const recentAlerts = await Alert.find()
      .populate('reportedBy assignedTo', 'name employeeId')
      .select('title type severity status createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(limit);

    const activities = recentAlerts.map(alert => ({
      id: alert._id,
      type: 'alert',
      title: alert.title,
      description: `${alert.type.replace(/_/g, ' ')} - ${alert.severity} severity`,
      user: alert.reportedBy?.name || 'Unknown',
      timestamp: alert.updatedAt,
      status: alert.status,
      severity: alert.severity
    }));

    res.json({
      success: true,
      data: { activities }
    });
  } catch (error) {
    logger.error('Get dashboard activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get alert summary for current user
// @route   GET /api/dashboard/my-alerts
// @access  Private
router.get('/my-alerts', auth, async (req, res) => {
  try {
    let filter = {};
    
    if (req.user.role === 'employee') {
      filter.reportedBy = req.user._id;
    } else if (['security_guard', 'security_manager'].includes(req.user.role)) {
      filter = {
        $or: [
          { reportedBy: req.user._id },
          { assignedTo: req.user._id }
        ]
      };
    }

    const [
      myAlerts,
      myOpenAlerts,
      myResolvedAlerts,
      assignedToMe
    ] = await Promise.all([
      Alert.find(filter)
        .select('title severity status createdAt')
        .sort({ createdAt: -1 })
        .limit(10),
      Alert.countDocuments({ ...filter, status: { $in: ['open', 'in_progress'] } }),
      Alert.countDocuments({ ...filter, status: 'resolved' }),
      Alert.countDocuments({ assignedTo: req.user._id, status: { $in: ['open', 'in_progress'] } })
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          total: myAlerts.length,
          open: myOpenAlerts,
          resolved: myResolvedAlerts,
          assignedToMe: assignedToMe
        },
        recentAlerts: myAlerts
      }
    });
  } catch (error) {
    logger.error('Get my alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;