const express = require('express');
const { body, query, validationResult } = require('express-validator');
const User = require('../models/User');
const Role = require('../models/Role');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users with pagination and filtering
// @access  Private (requires user.read permission)
router.get('/', [
  auth,
  authorize('user.read'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim(),
  query('department').optional().trim(),
  query('role').optional().trim(),
  query('isActive').optional().isBoolean()
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
      search,
      department,
      role,
      isActive
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { badgeNumber: { $regex: search, $options: 'i' } },
        { jobTitle: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (department) {
      filter.department = department;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Handle role filter
    if (role) {
      const roleDoc = await Role.findOne({ name: role });
      if (roleDoc) {
        filter.role = roleDoc._id;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get users with pagination
    const [users, total] = await Promise.all([
      User.find(filter)
        .populate('role', 'name description accessLevel')
        .select('-password -refreshToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (requires user.read permission)
router.get('/:id', [
  auth,
  authorize('user.read')
], async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('role', 'name description permissions accessLevel')
      .select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/users
// @desc    Create new user
// @access  Private (requires user.create permission)
router.post('/', [
  auth,
  authorize('user.create'),
  body('email').isEmail().normalizeEmail(),
  body('firstName').trim().isLength({ min: 2 }),
  body('lastName').trim().isLength({ min: 2 }),
  body('department').isIn(['Engineering', 'Human Resources', 'Security', 'Operations', 'Finance', 'Marketing', 'Administration']),
  body('jobTitle').trim().isLength({ min: 2 }),
  body('badgeNumber').trim().isLength({ min: 3 }),
  body('accessLevel').isInt({ min: 1, max: 10 }),
  body('roleId').isMongoId()
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
      email,
      firstName,
      lastName,
      department,
      jobTitle,
      badgeNumber,
      phone,
      emergencyContact,
      accessLevel,
      roleId
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { badgeNumber: badgeNumber.toUpperCase() }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or badge number already exists'
      });
    }

    // Verify role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);

    // Create user
    const user = await User.create({
      email,
      password: tempPassword,
      firstName,
      lastName,
      role: roleId,
      department,
      jobTitle,
      badgeNumber: badgeNumber.toUpperCase(),
      phone,
      emergencyContact,
      accessLevel
    });

    // Get user with populated role
    const populatedUser = await User.findById(user._id)
      .populate('role', 'name description permissions accessLevel')
      .select('-password -refreshToken');

    logger.info(`New user created: ${email} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: populatedUser,
      tempPassword // In production, send this via email
    });

  } catch (error) {
    logger.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (requires user.update permission)
router.put('/:id', [
  auth,
  authorize('user.update'),
  body('email').optional().isEmail().normalizeEmail(),
  body('firstName').optional().trim().isLength({ min: 2 }),
  body('lastName').optional().trim().isLength({ min: 2 }),
  body('department').optional().isIn(['Engineering', 'Human Resources', 'Security', 'Operations', 'Finance', 'Marketing', 'Administration']),
  body('jobTitle').optional().trim().isLength({ min: 2 }),
  body('accessLevel').optional().isInt({ min: 1, max: 10 }),
  body('roleId').optional().isMongoId(),
  body('isActive').optional().isBoolean()
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

    // Check if email is being changed and if it's already taken
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    // Verify role if being updated
    if (req.body.roleId) {
      const role = await Role.findById(req.body.roleId);
      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified'
        });
      }
      req.body.role = req.body.roleId;
      delete req.body.roleId;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('role', 'name description permissions accessLevel')
     .select('-password -refreshToken');

    logger.info(`User updated: ${updatedUser.email} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });

  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (soft delete)
// @access  Private (requires user.delete permission)
router.delete('/:id', [
  auth,
  authorize('user.delete')
], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent self-deletion
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Soft delete by deactivating
    user.isActive = false;
    await user.save();

    logger.info(`User deactivated: ${user.email} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/users/:id/reset-password
// @desc    Reset user password
// @access  Private (requires user.update permission)
router.post('/:id/reset-password', [
  auth,
  authorize('user.update')
], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    user.password = tempPassword;
    await user.save();

    logger.info(`Password reset for user: ${user.email} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Password reset successfully',
      tempPassword // In production, send this via email
    });

  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
