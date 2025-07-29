const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Incident = require('../models/Incident');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Get all incidents
// @route   GET /api/incidents
// @access  Private
router.get('/', protect, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['open', 'investigating', 'resolved', 'closed']).withMessage('Invalid status'),
  query('category').optional().isIn([
    'workplace_injury', 'near_miss', 'property_damage', 'security_breach',
    'fire_safety', 'chemical_spill', 'equipment_failure', 'workplace_violence',
    'environmental', 'other'
  ]).withMessage('Invalid category'),
  query('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity')
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

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};

    // Role-based access control
    if (req.user.role === 'employee') {
      query.reportedBy = req.user.id;
    }

    // Apply filters
    if (req.query.status) query.status = req.query.status;
    if (req.query.category) query.category = req.query.category;
    if (req.query.severity) query.severity = req.query.severity;
    if (req.query.assignedTo) query.assignedTo = req.query.assignedTo;

    // Date range filter
    if (req.query.dateFrom || req.query.dateTo) {
      query.dateTimeOccurred = {};
      if (req.query.dateFrom) query.dateTimeOccurred.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) query.dateTimeOccurred.$lte = new Date(req.query.dateTo);
    }

    // Search functionality
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { incidentNumber: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const total = await Incident.countDocuments(query);

    const incidents = await Incident.find(query)
      .populate('reportedBy', 'firstName lastName email department')
      .populate('assignedTo', 'firstName lastName email')
      .populate('witnesses', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    // Set total count header for frontend pagination
    res.set('X-Total-Count', total);

    res.status(200).json({
      success: true,
      count: incidents.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        limit,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      data: incidents
    });

  } catch (error) {
    logger.error('Get incidents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching incidents'
    });
  }
});

// @desc    Get single incident
// @route   GET /api/incidents/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('reportedBy', 'firstName lastName email department employeeId')
      .populate('assignedTo', 'firstName lastName email department')
      .populate('witnesses', 'firstName lastName email department')
      .populate('affectedPersons.user', 'firstName lastName email department')
      .populate('updates.updateBy', 'firstName lastName email');

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'employee' && 
        incident.reportedBy._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this incident'
      });
    }

    res.status(200).json({
      success: true,
      data: incident
    });

  } catch (error) {
    logger.error('Get incident error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching incident'
    });
  }
});

// @desc    Create new incident
// @route   POST /api/incidents
// @access  Private
router.post('/', protect, [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('description').trim().notEmpty().withMessage('Description is required')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('category').isIn([
    'workplace_injury', 'near_miss', 'property_damage', 'security_breach',
    'fire_safety', 'chemical_spill', 'equipment_failure', 'workplace_violence',
    'environmental', 'other'
  ]).withMessage('Invalid category'),
  body('severity').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity'),
  body('dateTimeOccurred').isISO8601().withMessage('Valid date and time is required')
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

    const incidentData = {
      ...req.body,
      reportedBy: req.user.id
    };

    const incident = await Incident.create(incidentData);

    // Populate incident for response
    await incident.populate('reportedBy', 'firstName lastName email department');

    // Send real-time notification
    const io = req.app.get('io');
    io.emit('incident-created', {
      incident: incident,
      message: `New ${incident.severity} incident reported: ${incident.title}`
    });

    // Send notifications to relevant users
    if (incident.severity === 'high' || incident.severity === 'critical') {
      const notificationUsers = await User.find({
        $or: [
          { role: 'safety_officer' },
          { role: 'manager', department: req.user.department },
          { role: 'admin' }
        ],
        isActive: true
      });

      notificationUsers.forEach(user => {
        io.to(`user-${user._id}`).emit('urgent-incident', {
          incident,
          message: `🚨 URGENT: ${incident.severity.toUpperCase()} incident reported`
        });
      });
    }

    logger.info(`New incident created: ${incident.incidentNumber} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: incident
    });

  } catch (error) {
    logger.error('Create incident error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating incident'
    });
  }
});

// @desc    Update incident
// @route   PUT /api/incidents/:id
// @access  Private (Manager, Safety Officer, Admin)
router.put('/:id', protect, authorize('manager', 'safety_officer', 'admin'), async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    // Track status changes
    const oldStatus = incident.status;
    const newStatus = req.body.status;

    // Add update to incident history
    if (req.body.comment || oldStatus !== newStatus) {
      const updateEntry = {
        updateBy: req.user.id,
        comment: req.body.comment,
        statusChange: oldStatus !== newStatus ? { from: oldStatus, to: newStatus } : undefined
      };
      
      incident.updates.push(updateEntry);
    }

    // Update incident
    Object.assign(incident, req.body);
    await incident.save();

    // Populate for response
    await incident.populate([
      { path: 'reportedBy', select: 'firstName lastName email department' },
      { path: 'assignedTo', select: 'firstName lastName email' },
      { path: 'updates.updateBy', select: 'firstName lastName email' }
    ]);

    // Send real-time notification for status changes
    if (oldStatus !== newStatus) {
      const io = req.app.get('io');
      io.emit('incident-updated', {
        incident: incident,
        message: `Incident ${incident.incidentNumber} status changed to ${newStatus}`
      });

      // Notify the reporter
      io.to(`user-${incident.reportedBy._id}`).emit('incident-status-change', {
        incident,
        message: `Your incident ${incident.incidentNumber} status changed to ${newStatus}`
      });
    }

    logger.info(`Incident updated: ${incident.incidentNumber} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      data: incident
    });

  } catch (error) {
    logger.error('Update incident error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating incident'
    });
  }
});

// @desc    Get incident statistics
// @route   GET /api/incidents/stats/dashboard
// @access  Private (Manager, Safety Officer, Admin)
router.get('/stats/dashboard', protect, authorize('manager', 'safety_officer', 'admin'), async (req, res) => {
  try {
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo) : new Date();

    const analytics = await Incident.getAnalytics(dateFrom, dateTo);

    res.status(200).json({
      success: true,
      data: analytics[0] || {}
    });

  } catch (error) {
    logger.error('Get incident stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching incident statistics'
    });
  }
});

// @desc    Delete incident
// @route   DELETE /api/incidents/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    await incident.deleteOne();

    logger.info(`Incident deleted: ${incident.incidentNumber} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Incident deleted successfully'
    });

  } catch (error) {
    logger.error('Delete incident error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting incident'
    });
  }
});

module.exports = router;