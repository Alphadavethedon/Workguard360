const express = require('express');
const Shift = require('../models/Shift');
const { protect, authorize } = require('../middleware/auth');
const { validateShift, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @desc    Get all shifts
// @route   GET /api/shifts
// @access  Private
router.get('/', protect, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by active status
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    const shifts = await Shift.find(query)
      .populate('createdBy', 'name')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Shift.countDocuments(query);

    res.json({
      success: true,
      data: {
        shifts,
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
      message: 'Error fetching shifts',
      error: error.message
    });
  }
});

// @desc    Get shift by ID
// @route   GET /api/shifts/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Shift not found'
      });
    }

    res.json({
      success: true,
      data: { shift }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shift',
      error: error.message
    });
  }
});

// @desc    Create new shift
// @route   POST /api/shifts
// @access  Private (HR/Admin only)
router.post('/', protect, authorize('admin', 'hr'), validateShift, async (req, res) => {
  try {
    const shiftData = {
      ...req.body,
      createdBy: req.user.id
    };

    const shift = await Shift.create(shiftData);

    await shift.populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Shift created successfully',
      data: { shift }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating shift',
      error: error.message
    });
  }
});

// @desc    Update shift
// @route   PUT /api/shifts/:id
// @access  Private (HR/Admin only)
router.put('/:id', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const allowedFields = [
      'name',
      'startTime',
      'endTime',
      'days',
      'description',
      'isActive',
      'allowedOvertime',
      'breakDuration'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const shift = await Shift.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name');

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Shift not found'
      });
    }

    res.json({
      success: true,
      message: 'Shift updated successfully',
      data: { shift }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating shift',
      error: error.message
    });
  }
});

// @desc    Delete shift
// @route   DELETE /api/shifts/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const shift = await Shift.findByIdAndDelete(req.params.id);

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Shift not found'
      });
    }

    res.json({
      success: true,
      message: 'Shift deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting shift',
      error: error.message
    });
  }
});

// @desc    Get active shifts
// @route   GET /api/shifts/active
// @access  Private
router.get('/active', protect, async (req, res) => {
  try {
    const shifts = await Shift.findActive();

    res.json({
      success: true,
      data: { shifts }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching active shifts',
      error: error.message
    });
  }
});

module.exports = router;