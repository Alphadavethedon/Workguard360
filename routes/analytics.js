const express = require('express');
const Incident = require('../models/Incident');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private (Manager, Safety Officer, Admin)
router.get('/dashboard', protect, authorize('manager', 'safety_officer', 'admin'), async (req, res) => {
  try {
    const [
      totalIncidents,
      openIncidents,
      totalUsers,
      criticalIncidents,
      incidentsByMonth,
      incidentsBySeverity,
      incidentsByCategory,
      usersByDepartment
    ] = await Promise.all([
      // Total incidents
      Incident.countDocuments(),
      
      // Open incidents
      Incident.countDocuments({ status: { $in: ['open', 'investigating'] } }),
      
      // Total active users
      User.countDocuments({ isActive: true }),
      
      // Critical incidents
      Incident.countDocuments({ severity: 'critical' }),
      
      // Incidents by month (last 12 months)
      Incident.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      
      // Incidents by severity
      Incident.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      
      // Incidents by category
      Incident.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      
      // Users by department
      User.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$department', count: { $sum: 1 } } }
      ])
    ]);

    // Calculate trends
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [
      incidentsThisMonth,
      incidentsLastMonth
    ] = await Promise.all([
      Incident.countDocuments({ createdAt: { $gte: lastMonth } }),
      Incident.countDocuments({ 
        createdAt: { 
          $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          $lt: lastMonth
        }
      })
    ]);

    const incidentTrend = incidentsLastMonth > 0 
      ? ((incidentsThisMonth - incidentsLastMonth) / incidentsLastMonth * 100).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalIncidents,
          openIncidents,
          totalUsers,
          criticalIncidents,
          incidentTrend: parseFloat(incidentTrend)
        },
        charts: {
          incidentsByMonth,
          incidentsBySeverity,
          incidentsByCategory,
          usersByDepartment
        }
      }
    });

  } catch (error) {
    logger.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard analytics'
    });
  }
});

// @desc    Get incident analytics
// @route   GET /api/analytics/incidents
// @access  Private (Manager, Safety Officer, Admin)
router.get('/incidents', protect, authorize('manager', 'safety_officer', 'admin'), async (req, res) => {
  try {
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo) : new Date();

    const analytics = await Incident.getAnalytics(dateFrom, dateTo);

    res.status(200).json({
      success: true,
      data: analytics[0] || {}
    });

  } catch (error) {
    logger.error('Get incident analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching incident analytics'
    });
  }
});

// @desc    Get real-time metrics
// @route   GET /api/analytics/realtime
// @access  Private (Manager, Safety Officer, Admin)
router.get('/realtime', protect, authorize('manager', 'safety_officer', 'admin'), async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      incidentsToday,
      incidentsThisWeek,
      activeUsers,
      pendingIncidents
    ] = await Promise.all([
      Incident.countDocuments({ createdAt: { $gte: today } }),
      Incident.countDocuments({ createdAt: { $gte: thisWeek } }),
      User.countDocuments({ isActive: true, lastLogin: { $gte: thisWeek } }),
      Incident.countDocuments({ status: { $in: ['open', 'investigating'] } })
    ]);

    res.status(200).json({
      success: true,
      data: {
        incidentsToday,
        incidentsThisWeek,
        activeUsers,
        pendingIncidents,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Get realtime metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching realtime metrics'
    });
  }
});

module.exports = router;