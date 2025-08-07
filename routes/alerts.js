const express = require('express');
const { body, validationResult } = require('express-validator');
const Alert = require('../models/Alert');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Apply filters
    if (req.query.status) filter.status = req.query.status;
    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.department) filter.department = req.query.department;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    if (req.query.isUrgent !== undefined) filter.isUrgent = req.query.isUrgent === 'true';
    
    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
    }

    // Search filter
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Role-based filtering
    if (req.user.role === 'employee') {
      filter.reportedBy = req.user._id;
    }

    const [alerts, total] = await Promise.all([
      Alert.find(filter)
        .populate('reportedBy assignedTo', 'name email employeeId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Alert.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        alerts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalAlerts: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get alert by ID
// @route   GET /api/alerts/:id
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('reportedBy assignedTo resolvedBy', 'name email employeeId')
      .populate('comments.user', 'name email employeeId')
      .populate('timeline.user', 'name email employeeId');
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Employees can only view their own alerts
    if (req.user.role === 'employee' && 
        alert.reportedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { alert }
    });
  } catch (error) {
    logger.error('Get alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create alert
// @route   POST /api/alerts
// @access  Private
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('type').isIn([
    'security_breach', 'unauthorized_access', 'system_failure', 'maintenance_required',
    'policy_violation', 'emergency', 'suspicious_activity', 'equipment_malfunction',
    'access_denied', 'data_breach'
  ]).withMessage('Invalid alert type'),
  body('severity').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity'),
  body('location.building').trim().isLength({ min: 1 }).withMessage('Building is required'),
  body('department').trim().isLength({ min: 1 }).withMessage('Department is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      type,
      severity,
      location,
      department,
      tags,
      isUrgent
    } = req.body;

    const alert = await Alert.create({
      title,
      description,
      type,
      severity,
      location,
      department,
      tags: tags || [],
      isUrgent: isUrgent || (severity === 'critical' || severity === 'high'),
      reportedBy: req.user._id,
      priority: severity === 'critical' ? 5 : severity === 'high' ? 4 : severity === 'medium' ? 3 : 2
    });

    await alert.populate('reportedBy', 'name email employeeId');

    // Emit real-time notification
    const io = req.app.get('io');
    io.emit('newAlert', {
      id: alert._id,
      title: alert.title,
      severity: alert.severity,
      type: alert.type,
      reportedBy: alert.reportedBy.name
    });

    logger.info(`New alert created: ${title} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: { alert }
    });
  } catch (error) {
    logger.error('Create alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update alert
// @route   PUT /api/alerts/:id
// @access  Private
router.put('/:id', [
  auth,
  authorize('admin', 'security_manager', 'security_guard'),
  body('title').optional().trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed', 'dismissed']).withMessage('Invalid status'),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    const allowedUpdates = ['title', 'description', 'status', 'severity', 'assignedTo', 'tags', 'resolution'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Handle resolution
    if (updates.status === 'resolved' && !alert.resolvedAt) {
      updates.resolvedAt = new Date();
      updates.resolvedBy = req.user._id;
      if (!updates.resolution) {
        updates.resolution = 'Alert marked as resolved';
      }
    }

    const updatedAlert = await Alert.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('reportedBy assignedTo resolvedBy', 'name email employeeId');

    // Emit real-time notification for status changes
    if (updates.status) {
      const io = req.app.get('io');
      io.emit('alertUpdated', {
        id: updatedAlert._id,
        title: updatedAlert.title,
        status: updatedAlert.status,
        updatedBy: req.user.name
      });
    }

    logger.info(`Alert updated: ${updatedAlert.title} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Alert updated successfully',
      data: { alert: updatedAlert }
    });
  } catch (error) {
    logger.error('Update alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete alert
// @route   DELETE /api/alerts/:id
// @access  Private (Admin only)
router.delete('/:id', [auth, authorize('admin')], async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    await Alert.findByIdAndDelete(req.params.id);

    logger.info(`Alert deleted: ${alert.title} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    logger.error('Delete alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Add comment to alert
// @route   POST /api/alerts/:id/comments
// @access  Private
router.post('/:id/comments', [
  auth,
  authorize('admin', 'security_manager', 'security_guard'),
  body('content').trim().isLength({ min: 1 }).withMessage('Comment content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    await alert.addComment(req.user._id, req.body.content);
    
    const updatedAlert = await Alert.findById(req.params.id)
      .populate('comments.user', 'name email employeeId');

    logger.info(`Comment added to alert: ${alert.title} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: { 
        alert: updatedAlert,
        newComment: updatedAlert.comments[updatedAlert.comments.length - 1]
      }
    });
  } catch (error) {
    logger.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get alert statistics
// @route   GET /api/alerts/stats/overview
// @access  Private
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const [
      totalAlerts,
      alertsByStatus,
      alertsBySeverity,
      alertsByType,
      recentAlerts,
      urgentAlerts
    ] = await Promise.all([
      Alert.countDocuments(),
      Alert.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Alert.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      Alert.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      Alert.find()
        .populate('reportedBy', 'name employeeId')
        .select('title severity status createdAt')
        .sort({ createdAt: -1 })
        .limit(5),
      Alert.countDocuments({ isUrgent: true, status: { $in: ['open', 'in_progress'] } })
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalAlerts,
          urgentAlerts,
          openAlerts: alertsByStatus.find(s => s._id === 'open')?.count || 0,
          resolvedAlerts: alertsByStatus.find(s => s._id === 'resolved')?.count || 0
        },
        alertsByStatus: alertsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        alertsBySeverity: alertsBySeverity.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        topAlertTypes: alertsByType,
        recentAlerts
      }
    });
  } catch (error) {
    logger.error('Get alert stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;