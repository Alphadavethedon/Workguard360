const express = require('express');
const User = require('../models/User');
const Alert = require('../models/Alert');
const Accesslog = require('../models/Accesslog.js');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private (requires dashboard.read permission)
router.get('/stats', [
  auth,
  authorize('dashboard.read')
], async (req, res) => {
  try {
    // Get current date for today's calculations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get statistics in parallel
    const [
      totalEmployees,
      activeEmployees,
      totalAlerts,
      criticalAlerts,
      todayEntries,
      complianceScore,
      systemHealth
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Alert.countDocuments({ status: { $ne: 'resolved' } }),
      Alert.countDocuments({ severity: 'critical', status: { $ne: 'resolved' } }),
      AccessLog.countDocuments({
        action: 'entry',
        success: true,
        createdAt: { $gte: today, $lt: tomorrow }
      }),
      calculateComplianceScore(),
      calculateSystemHealth()
    ]);

    const stats = {
      totalEmployees,
      activeEmployees,
      totalAlerts,
      criticalAlerts,
      todayEntries,
      complianceScore,
      systemHealth
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/dashboard/recent-activity
// @desc    Get recent access activity
// @access  Private (requires dashboard.read permission)
router.get('/recent-activity', [
  auth,
  authorize('dashboard.read')
], async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const recentActivity = await AccessLog.find()
      .populate('user', 'firstName lastName department badgeNumber')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Transform data for frontend
    const formattedActivity = recentActivity.map(log => ({
      id: log._id,
      user: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Unknown User',
      action: formatAction(log.action, log.success),
      time: formatTimeAgo(log.createdAt),
      status: log.success ? 'success' : (log.action === 'denied' ? 'alert' : 'warning'),
      location: log.location,
      badgeNumber: log.user?.badgeNumber || log.badgeNumber
    }));

    res.json({
      success: true,
      data: formattedActivity
    });

  } catch (error) {
    logger.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/dashboard/alerts-summary
// @desc    Get alerts summary for dashboard
// @access  Private (requires dashboard.read permission)
router.get('/alerts-summary', [
  auth,
  authorize('dashboard.read')
], async (req, res) => {
  try {
    const [
      activeAlerts,
      criticalAlerts,
      recentAlerts
    ] = await Promise.all([
      Alert.countDocuments({ status: 'active' }),
      Alert.countDocuments({ severity: 'critical', status: { $ne: 'resolved' } }),
      Alert.find({ status: { $ne: 'resolved' } })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('assignedTo', 'firstName lastName')
    ]);

    const summary = {
      activeAlerts,
      criticalAlerts,
      recentAlerts: recentAlerts.map(alert => ({
        id: alert._id,
        title: alert.title,
        severity: alert.severity,
        type: alert.type,
        location: alert.location,
        createdAt: alert.createdAt,
        assignedTo: alert.assignedTo ? 
          `${alert.assignedTo.firstName} ${alert.assignedTo.lastName}` : 
          'Unassigned'
      }))
    };

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    logger.error('Get alerts summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/dashboard/access-trends
// @desc    Get access trends for charts
// @access  Private (requires dashboard.read permission)
router.get('/access-trends', [
  auth,
  authorize('dashboard.read')
], async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get daily access counts
    const dailyAccess = await AccessLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          action: 'entry',
          success: true
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
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Get hourly access for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const hourlyAccess = await AccessLog.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
          action: 'entry',
          success: true
        }
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        dailyAccess,
        hourlyAccess
      }
    });

  } catch (error) {
    logger.error('Get access trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper functions
async function calculateComplianceScore() {
  try {
    const [totalUsers, activeUsers, complianceAlerts] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Alert.countDocuments({ type: 'compliance', status: { $ne: 'resolved' } })
    ]);

    if (totalUsers === 0) return 100;

    const baseScore = (activeUsers / totalUsers) * 100;
    const penalty = Math.min(complianceAlerts * 2, 20); // Max 20% penalty
    
    return Math.max(Math.round(baseScore - penalty), 0);
  } catch (error) {
    logger.error('Calculate compliance score error:', error);
    return 0;
  }
}

async function calculateSystemHealth() {
  try {
    // Simple system health calculation based on recent failures
    const recentFailures = await AccessLog.countDocuments({
      success: false,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    const systemAlerts = await Alert.countDocuments({
      type: 'system',
      status: 'active'
    });

    // Calculate health score (0-100)
    let healthScore = 100;
    healthScore -= Math.min(recentFailures * 2, 30); // Max 30% penalty for failures
    healthScore -= Math.min(systemAlerts * 5, 20); // Max 20% penalty for system alerts

    return Math.max(Math.round(healthScore), 0);
  } catch (error) {
    logger.error('Calculate system health error:', error);
    return 0;
  }
}

function formatAction(action, success) {
  if (!success) {
    return `Access denied - ${action}`;
  }
  
  switch (action) {
    case 'entry':
      return 'Badge scan - Entry';
    case 'exit':
      return 'Badge scan - Exit';
    default:
      return `Badge scan - ${action}`;
  }
}

function formatTimeAgo(date) {
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
}

module.exports = router;
