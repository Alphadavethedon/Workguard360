const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Mock safety compliance data (in production, use a proper model)
let safetyCompliance = [];

// @desc    Get all safety compliance items
// @route   GET /api/safety
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    let filteredItems = safetyCompliance;

    // Role-based access control
    if (req.user.role === 'employee') {
      filteredItems = safetyCompliance.filter(item => 
        item.assignedTo === req.user.id
      );
    }

    // Apply filters
    if (req.query.status) {
      filteredItems = filteredItems.filter(item => item.status === req.query.status);
    }
    if (req.query.type) {
      filteredItems = filteredItems.filter(item => item.type === req.query.type);
    }
    if (req.query.department) {
      filteredItems = filteredItems.filter(item => item.department === req.query.department);
    }

    const total = filteredItems.length;
    const items = filteredItems.slice(startIndex, startIndex + limit);

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      data: items
    });

  } catch (error) {
    logger.error('Get safety compliance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching safety compliance items'
    });
  }
});

// @desc    Create new safety compliance item
// @route   POST /api/safety
// @access  Private (Safety Officer, Manager, Admin)
router.post('/', protect, authorize('safety_officer', 'manager', 'admin'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('type').isIn(['safety_inspection', 'audit', 'training_requirement', 'equipment_check', 'policy_review']).withMessage('Invalid type'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('assignedTo').notEmpty().withMessage('Assigned user is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required')
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

    const item = {
      id: Date.now().toString(),
      ...req.body,
      createdBy: req.user.id,
      createdAt: new Date(),
      status: 'pending',
      checklist: req.body.checklist || [],
      findings: []
    };

    safetyCompliance.push(item);

    // Send real-time notification
    const io = req.app.get('io');
    io.to(`user-${item.assignedTo}`).emit('safety-compliance-assigned', {
      item: item,
      message: `New safety compliance task assigned: ${item.title}`
    });

    logger.info(`Safety compliance item created: ${item.id} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: item
    });

  } catch (error) {
    logger.error('Create safety compliance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating safety compliance item'
    });
  }
});

// @desc    Update safety compliance item
// @route   PUT /api/safety/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const itemIndex = safetyCompliance.findIndex(item => item.id === req.params.id);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Safety compliance item not found'
      });
    }

    const item = safetyCompliance[itemIndex];

    // Check permissions
    const canUpdate = req.user.id === item.assignedTo ||
                     ['safety_officer', 'manager', 'admin'].includes(req.user.role);

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this item'
      });
    }

    // Update item
    const updatedItem = {
      ...item,
      ...req.body,
      updatedAt: new Date(),
      updatedBy: req.user.id
    };

    // Mark as completed if all checklist items are completed
    if (req.body.checklist) {
      const allCompleted = req.body.checklist.every(checkItem => checkItem.completed);
      if (allCompleted && item.status !== 'completed') {
        updatedItem.status = 'completed';
        updatedItem.completedBy = req.user.id;
        updatedItem.completedAt = new Date();
      }
    }

    safetyCompliance[itemIndex] = updatedItem;

    logger.info(`Safety compliance item updated: ${updatedItem.id} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      data: updatedItem
    });

  } catch (error) {
    logger.error('Update safety compliance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating safety compliance item'
    });
  }
});

// @desc    Get safety statistics
// @route   GET /api/safety/stats
// @access  Private (Safety Officer, Manager, Admin)
router.get('/stats', protect, authorize('safety_officer', 'manager', 'admin'), async (req, res) => {
  try {
    const stats = {
      total: safetyCompliance.length,
      pending: safetyCompliance.filter(item => item.status === 'pending').length,
      inProgress: safetyCompliance.filter(item => item.status === 'in_progress').length,
      completed: safetyCompliance.filter(item => item.status === 'completed').length,
      overdue: safetyCompliance.filter(item => 
        item.status !== 'completed' && new Date(item.dueDate) < new Date()
      ).length,
      byType: safetyCompliance.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {}),
      byDepartment: safetyCompliance.reduce((acc, item) => {
        acc[item.department] = (acc[item.department] || 0) + 1;
        return acc;
      }, {})
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Get safety stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching safety statistics'
    });
  }
});

module.exports = router;