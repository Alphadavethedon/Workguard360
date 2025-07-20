const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { validateUser, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private (HR/Admin only)
router.get('/', protect, authorize('admin', 'hr'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    // Filter by role
    if (req.query.role) {
      query.role = req.query.role;
    }

    // Filter by department
    if (req.query.department) {
      query.department = new RegExp(req.query.department, 'i');
    }

    // Filter by active status
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    // Search by name or employee ID
    if (req.query.search) {
      query.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { employeeId: new RegExp(req.query.search, 'i') }
      ];
    }

    const users = await User.find(query)
      .populate('shift', 'name startTime endTime')
      .populate('authorizedFloors', 'name level securityLevel')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password');

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
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
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (HR/Admin only)
router.get('/:id', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('shift', 'name startTime endTime days')
      .populate('authorizedFloors', 'name level securityLevel description')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// @desc    Create new user
// @route   POST /api/users
// @access  Private (HR/Admin only)
router.post('/', protect, authorize('admin', 'hr'), validateUser, async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      employeeId,
      department,
      role,
      shift,
      authorizedFloors,
      phoneNumber,
      emergencyContact
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { employeeId }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or employee ID already exists'
      });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'defaultPassword123',
      employeeId,
      department,
      role: role || 'employee',
      shift,
      authorizedFloors,
      phoneNumber,
      emergencyContact
    });

    await user.populate([
      { path: 'shift', select: 'name startTime endTime' },
      { path: 'authorizedFloors', select: 'name level' }
    ]);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: user.getPublicProfile() }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (HR/Admin only)
router.put('/:id', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const allowedFields = [
      'name',
      'email',
      'employeeId',
      'department',
      'role',
      'shift',
      'authorizedFloors',
      'phoneNumber',
      'emergencyContact',
      'isActive'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('shift', 'name startTime endTime')
      .populate('authorizedFloors', 'name level securityLevel')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

// @desc    Deactivate user
// @route   PATCH /api/users/:id/deactivate
// @access  Private (HR/Admin only)
router.patch('/:id/deactivate', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deactivated successfully',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deactivating user',
      error: error.message
    });
  }
});

// @desc    Activate user
// @route   PATCH /api/users/:id/activate
// @access  Private (HR/Admin only)
router.patch('/:id/activate', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User activated successfully',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error activating user',
      error: error.message
    });
  }
});

// @desc    Reset user password
// @route   PATCH /api/users/:id/reset-password
// @access  Private (Admin only)
router.patch('/:id/reset-password', protect, authorize('admin'), async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.password = password;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private (HR/Admin only)
router.get('/stats', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      usersByRole,
      usersByDepartment,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      User.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      User.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name employeeId department createdAt')
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        usersByRole,
        usersByDepartment,
        recentUsers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
});

module.exports = router;