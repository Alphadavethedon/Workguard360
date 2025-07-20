const express = require('express');
const User = require('../models/User');
const AccessLog = require('../models/AccessLog');
const Alert = require('../models/Alert');
const Floor = require('../models/Floor');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get basic counts
    const [
      totalUsers,
      activeUsers,
      totalFloors,
      todayAccessLogs,
      activeAlerts,
      todayViolations
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Floor.countDocuments({ isActive: true }),
      AccessLog.countDocuments({
        timestamp: { $gte: today, $lt: tomorrow }
      }),
      Alert.countDocuments({ status: { $in: ['active', 'acknowledged'] } }),
      AccessLog.countDocuments({
        timestamp: { $gte: today, $lt: tomorrow },
        isAuthorized: false
      })
    ]);

    // Get recent access logs
    const recentAccessLogs = await AccessLog.find({
      timestamp: { $gte: today, $lt: tomorrow }
    })
      .populate('user', 'name employeeId')
      .populate('floor', 'name level')
      .sort({ timestamp: -1 })
      .limit(10);

    // Get violation trends (last 7 days)
    const violationTrends = await AccessLog.aggregate([
      {
        $match: {
          timestamp: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          },
          isAuthorized: false
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get access patterns by hour
    const accessPatterns = await AccessLog.aggregate([
      {
        $match: {
          timestamp: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: { $hour: "$timestamp" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          totalFloors,
          todayAccessLogs,
          activeAlerts,
          todayViolations
        },
        recentAccessLogs,
        violationTrends,
        accessPatterns
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
});

// @desc    Get real-time activity feed
// @route   GET /api/dashboard/activity
// @access  Private
router.get('/activity', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const activities = await AccessLog.find()
      .populate('user', 'name employeeId department')
      .populate('floor', 'name level securityLevel')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AccessLog.countDocuments();

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching activity feed',
      error: error.message
    });
  }
});

// @desc    Get security overview
// @route   GET /api/dashboard/security
// @access  Private (Security/Admin only)
router.get('/security', protect, authorize('admin', 'security'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Security metrics
    const [
      criticalAlerts,
      weeklyViolations,
      unauthorizedAttempts,
      floorBreaches
    ] = await Promise.all([
      Alert.countDocuments({ 
        severity: 'critical', 
        status: { $in: ['active', 'acknowledged'] }
      }),
      AccessLog.countDocuments({
        timestamp: { $gte: lastWeek },
        isAuthorized: false
      }),
      AccessLog.countDocuments({
        timestamp: { $gte: lastWeek },
        violationType: 'unauthorized_access'
      }),
      AccessLog.countDocuments({
        timestamp: { $gte: lastWeek },
        violationType: 'floor_breach'
      })
    ]);

    // Top violation types
    const violationTypes = await AccessLog.aggregate([
      {
        $match: {
          timestamp: { $gte: lastWeek },
          isAuthorized: false
        }
      },
      {
        $group: {
          _id: '$violationType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Most accessed floors
    const floorAccess = await AccessLog.aggregate([
      {
        $match: {
          timestamp: { $gte: today }
        }
      },
      {
        $group: {
          _id: '$floor',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'floors',
          localField: '_id',
          foreignField: '_id',
          as: 'floor'
        }
      },
      { $unwind: '$floor' }
    ]);

    res.json({
      success: true,
      data: {
        metrics: {
          criticalAlerts,
          weeklyViolations,
          unauthorizedAttempts,
          floorBreaches
        },
        violationTypes,
        floorAccess
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching security overview',
      error: error.message
    });
  }
});

module.exports = router;