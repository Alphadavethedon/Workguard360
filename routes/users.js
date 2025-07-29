const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Manager, Admin)
router.get('/', protect, authorize('manager', 'safety_officer', 'admin'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('role').optional().isIn(['employee', 'manager', 'safety_officer', 'admin']).withMessage('Invalid role'),
  query('department').optional().isIn(['HR', 'IT', 'Operations', 'Safety', 'Maintenance', 'Security', 'Management']).withMessage('Invalid department')
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
    let query = { isActive: true };

    if (req.query.role) query.role = req.query.role;
    if (req.query.department) query.department = req.query.department;
    if (req.query.search) {
      query.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { employeeId: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.set('X-Total-Count', total);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        limit,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      data: users
    });

  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user can view this profile
    if (req.user.id !== req.params.id && 
        !['manager', 'safety_officer', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this profile'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user'
    });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin only for role changes)
router.put('/:id', protect, [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().matches(/^\+?[\d\s-()]+$/).withMessage('Invalid phone number format'),
  body('role').optional().isIn(['employee', 'manager', 'safety_officer', 'admin']).withMessage('Invalid role'),
  body('department').optional().isIn(['HR', 'IT', 'Operations', 'Safety', 'Maintenance', 'Security', 'Management']).withMessage('Invalid department')
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

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check permissions
    const isOwnProfile = req.user.id === req.params.id;
    const isAdmin = req.user.role === 'admin';
    const isManager = req.user.role === 'manager';

    if (!isOwnProfile && !isAdmin && !isManager) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    // Restrict role changes to admins only
    if (req.body.role && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can change user roles'
      });
    }

    // Define allowed fields based on permissions
    let allowedFields;
    if (isAdmin) {
      allowedFields = ['firstName', 'lastName', 'email', 'phone', 'role', 'department', 'isActive', 'emergencyContact', 'location'];
    } else if (isManager) {
      allowedFields = ['firstName', 'lastName', 'phone', 'department', 'emergencyContact', 'location'];
    } else {
      allowedFields = ['firstName', 'lastName', 'phone', 'emergencyContact', 'avatar', 'preferences'];
    }

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    logger.info(`User updated: ${updatedUser.email} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      data: updatedUser
    });

  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats/dashboard
// @access  Private (Manager, Admin)
router.get('/stats/dashboard', protect, authorize('manager', 'safety_officer', 'admin'), async (req, res) => {
  try {
    const stats = await Promise.all([
      // Total active users
      User.countDocuments({ isActive: true }),
      
      // Users by role
      User.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      
      // Users by department
      User.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$department', count: { $sum: 1 } } }
      ]),
      
      // Training status distribution
      User.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$safetyTrainingStatus', count: { $sum: 1 } } }
      ]),
      
      // Recent registrations
      User.countDocuments({
        isActive: true,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers: stats[0],
        byRole: stats[1],
        byDepartment: stats[2],
        trainingStatus: stats[3],
        recentRegistrations: stats[4]
      }
    });

  } catch (error) {
    logger.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics'
    });
  }
});

module.exports = router;