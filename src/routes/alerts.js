const express = require('express');
const Alert = require('../models/Alert');
const { protect, authorize } = require('../middleware/auth');
const { validateAlert, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Private
router.get('/', protect, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by type
    if (req.query.type) {
      query.type = req.query.type;
    }

    // Filter by severity
    if (req.query.severity) {
      query.severity = req.query.severity;
    }

    // Filter by assigned user
    if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const alerts = await Alert.find(query)
      .populate('relatedUser', 'name employeeId department')
      .populate('assignedTo', 'name')
      .populate('createdBy', 'name')
      .populate('relatedFloor', 'name level')
      .sort({ severity: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Alert.countDocuments(query);

    res.json({
      success: true,
      data: {
        alerts,
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
      message: 'Error fetching alerts',
      error: error.message
    });
  }
});

// @desc    Get active alerts
// @route   GET /api/alerts/active
// @access  Private
router.get('/active', protect, async (req, res) => {
  try {
    const alerts = await Alert.getActive();

    res.json({
      success: true,
      data: { alerts }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching active alerts',
      error: error.message
    });
  }
});

// @desc    Get alerts by severity
// @route   GET /api/alerts/severity/:severity
// @access  Private
router.get('/severity/:severity', protect, async (req, res) => {
  try {
    const { severity } = req.params;
    const alerts = await Alert.getBySeverity(severity);

    res.json({
      success: true,
      data: { alerts }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts by severity',
      error: error.message
    });
  }
});

// @desc    Create new alert
// @route   POST /api/alerts
// @access  Private (Security/Admin only)
router.post('/', protect, authorize('admin', 'security'), validateAlert, async (req, res) => {
  try {
    const alertData = {
      ...req.body,
      createdBy: req.user.id
    };

    const alert = await Alert.create(alertData);

    await alert.populate([
      { path: 'relatedUser', select: 'name employeeId' },
      { path: 'createdBy', select: 'name' },
      { path: 'relatedFloor', select: 'name level' }
    ]);

    // Emit real-time alert
    const io = req.app.get('io');
    io.emit('new-alert', alert);

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: { alert }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating alert',
      error: error.message
    });
  }
});

// @desc    Get alert by ID
// @route   GET /api/alerts/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('relatedUser', 'name employeeId department phoneNumber')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .populate('acknowledgedBy', 'name')
      .populate('resolvedBy', 'name')
      .populate('relatedFloor', 'name level securityLevel')
      .populate('relatedAccessLog');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      data: { alert }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching alert',
      error: error.message
    });
  }
});

// @desc    Update alert
// @route   PUT /api/alerts/:id
// @access  Private (Security/Admin only)
router.put('/:id', protect, authorize('admin', 'security'), async (req, res) => {
  try {
    const allowedFields = ['title', 'message', 'type', 'severity', 'assignedTo', 'status'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate([
      { path: 'relatedUser', select: 'name employeeId' },
      { path: 'assignedTo', select: 'name' },
      { path: 'relatedFloor', select: 'name level' }
    ]);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('alert-updated', alert);

    res.json({
      success: true,
      message: 'Alert updated successfully',
      data: { alert }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating alert',
      error: error.message
    });
  }
});

// @desc    Acknowledge alert
// @route   PATCH /api/alerts/:id/acknowledge
// @access  Private
router.patch('/:id/acknowledge', protect, async (req, res) => {
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

    await alert.acknowledge(req.user.id);

    await alert.populate([
      { path: 'acknowledgedBy', select: 'name' },
      { path: 'relatedUser', select: 'name employeeId' }
    ]);

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('alert-acknowledged', alert);

    res.json({
      success: true,
      message: 'Alert acknowledged successfully',
      data: { alert }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error acknowledging alert',
      error: error.message
    });
  }
});

// @desc    Resolve alert
// @route   PATCH /api/alerts/:id/resolve
// @access  Private (Security/Admin only)
router.patch('/:id/resolve', protect, authorize('admin', 'security'), async (req, res) => {
  try {
    const { resolution } = req.body;
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    if (alert.status === 'resolved' || alert.status === 'archived') {
      return res.status(400).json({
        success: false,
        message: 'Alert is already resolved or archived'
      });
    }

    await alert.resolve(req.user.id, resolution);

    await alert.populate([
      { path: 'resolvedBy', select: 'name' },
      { path: 'relatedUser', select: 'name employeeId' }
    ]);

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('alert-resolved', alert);

    res.json({
      success: true,
      message: 'Alert resolved successfully',
      data: { alert }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resolving alert',
      error: error.message
    });
  }
});

// @desc    Archive alert
// @route   PATCH /api/alerts/:id/archive
// @access  Private (Admin only)
router.patch('/:id/archive', protect, authorize('admin'), async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { status: 'archived' },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      message: 'Alert archived successfully',
      data: { alert }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error archiving alert',
      error: error.message
    });
  }
});

// @desc    Delete alert
// @route   DELETE /api/alerts/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting alert',
      error: error.message
    });
  }
});

module.exports = router;