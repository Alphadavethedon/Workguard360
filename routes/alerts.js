const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Alert = require('../models/Alert');
const User = require('../models/User');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/alerts
// @desc    Get all alerts with pagination and filtering
// @access  Private (requires alerts.read permission)
router.get('/', [
  auth,
  authorize('alerts.read'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['security', 'compliance', 'system', 'emergency']),
  query('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
  query('status').optional().isIn(['active', 'acknowledged', 'resolved']),
  query('search').optional().trim()
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
      severity,
      status,
      search
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { triggeredBy: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get alerts with pagination
    const [alerts, total] = await Promise.all([
      Alert.find(filter)
        .populate('assignedTo', 'firstName lastName email')
        .populate('acknowledgedBy', 'firstName lastName email')
        .populate('resolvedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Alert.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        alerts,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
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

// @route   GET /api/alerts/:id
// @desc    Get alert by ID
// @access  Private (requires alerts.read permission)
router.get('/:id', [
  auth,
  authorize('alerts.read')
], async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email department')
      .populate('acknowledgedBy', 'firstName lastName email')
      .populate('resolvedBy', 'firstName lastName email');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      data: alert
    });

  } catch (error) {
    logger.error('Get alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/alerts
// @desc    Create new alert
// @access  Private (requires alerts.create permission)
router.post('/', [
  auth,
  authorize('alerts.create'),
  body('type').isIn(['security', 'compliance', 'system', 'emergency']),
  body('severity').isIn(['low', 'medium', 'high', 'critical']),
  body('title').trim().isLength({ min: 5, max: 200 }),
  body('description').trim().isLength({ min: 10, max: 1000 }),
  body('location').trim().isLength({ min: 3 }),
  body('triggeredBy').trim().isLength({ min: 3 }),
  body('assignedTo').optional().isMongoId()
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
      type,
      severity,
      title,
      description,
      location,
      triggeredBy,
      assignedTo,
      metadata = {}
    } = req.body;

    // Verify assigned user exists if provided
    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user not found'
        });
      }
    }

    // Create alert
    const alert = await Alert.create({
      type,
      severity,
      title,
      description,
      location,
      triggeredBy,
      assignedTo,
      metadata
    });

    // Populate the created alert
    const populatedAlert = await Alert.findById(alert._id)
      .populate('assignedTo', 'firstName lastName email department');

    // Emit real-time notification
    const io = req.app.get('io');
    io.to('dashboard').emit('new-alert', populatedAlert);

    logger.info(`New alert created: ${title} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: populatedAlert
    });

  } catch (error) {
    logger.error('Create alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /api/alerts/:id/acknowledge
// @desc    Acknowledge alert
// @access  Private (requires alerts.manage permission)
router.patch('/:id/acknowledge', [
  auth,
  authorize('alerts.manage')
], async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    if (alert.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Only active alerts can be acknowledged'
      });
    }

    // Update alert
    alert.status = 'acknowledged';
    alert.acknowledgedBy = req.user.id;
    alert.acknowledgedAt = new Date();
    await alert.save();

    // Populate the updated alert
    const populatedAlert = await Alert.findById(alert._id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('acknowledgedBy', 'firstName lastName email')
      .populate('resolvedBy', 'firstName lastName email');

    // Emit real-time update
    const io = req.app.get('io');
    io.to('dashboard').emit('alert-updated', populatedAlert);

    logger.info(`Alert acknowledged: ${alert.title} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Alert acknowledged successfully',
      data: populatedAlert
    });

  } catch (error) {
    logger.error('Acknowledge alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /api/alerts/:id/resolve
// @desc    Resolve alert
// @access  Private (requires alerts.manage permission)
router.patch('/:id/resolve', [
  auth,
  authorize('alerts.manage'),
  body('resolution').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    if (alert.status === 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'Alert is already resolved'
      });
    }

    // Update alert
    alert.status = 'resolved';
    alert.resolvedBy = req.user.id;
    alert.resolvedAt = new Date();
    
    if (req.body.resolution) {
      alert.metadata.resolution = req.body.resolution;
    }
    
    await alert.save();

    // Populate the updated alert
    const populatedAlert = await Alert.findById(alert._id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('acknowledgedBy', 'firstName lastName email')
      .populate('resolvedBy', 'firstName lastName email');

    // Emit real-time update
    const io = req.app.get('io');
    io.to('dashboard').emit('alert-updated', populatedAlert);

    logger.info(`Alert resolved: ${alert.title} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Alert resolved successfully',
      data: populatedAlert
    });

  } catch (error) {
    logger.error('Resolve alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/alerts/:id
// @desc    Update alert
// @access  Private (requires alerts.update permission)
router.put('/:id', [
  auth,
  authorize('alerts.update'),
  body('type').optional().isIn(['security', 'compliance', 'system', 'emergency']),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('title').optional().trim().isLength({ min: 5, max: 200 }),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }),
  body('location').optional().trim().isLength({ min: 3 }),
  body('assignedTo').optional().isMongoId()
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

    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Verify assigned user exists if provided
    if (req.body.assignedTo) {
      const assignedUser = await User.findById(req.body.assignedTo);
      if (!assignedUser) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user not found'
        });
      }
    }

    // Update alert
    const updatedAlert = await Alert.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'firstName lastName email')
     .populate('acknowledgedBy', 'firstName lastName email')
     .populate('resolvedBy', 'firstName lastName email');

    // Emit real-time update
    const io = req.app.get('io');
    io.to('dashboard').emit('alert-updated', updatedAlert);

    logger.info(`Alert updated: ${updatedAlert.title} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Alert updated successfully',
      data: updatedAlert
    });

  } catch (error) {
    logger.error('Update alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/alerts/:id
// @desc    Delete alert
// @access  Private (requires alerts.delete permission)
router.delete('/:id', [
  auth,
  authorize('alerts.delete')
], async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    await Alert.findByIdAndDelete(req.params.id);

    // Emit real-time update
    const io = req.app.get('io');
    io.to('dashboard').emit('alert-deleted', { id: req.params.id });

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

module.exports = router;
