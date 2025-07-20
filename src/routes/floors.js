const express = require('express');
const Floor = require('../models/Floor');
const { protect, authorize } = require('../middleware/auth');
const { validateFloor, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @desc    Get all floors
// @route   GET /api/floors
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

    // Filter by security level
    if (req.query.securityLevel) {
      query.securityLevel = req.query.securityLevel;
    }

    const floors = await Floor.find(query)
      .populate('createdBy', 'name')
      .sort({ level: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Floor.countDocuments(query);

    res.json({
      success: true,
      data: {
        floors,
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
      message: 'Error fetching floors',
      error: error.message
    });
  }
});

// @desc    Get floor by ID
// @route   GET /api/floors/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const floor = await Floor.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!floor) {
      return res.status(404).json({
        success: false,
        message: 'Floor not found'
      });
    }

    res.json({
      success: true,
      data: { floor }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching floor',
      error: error.message
    });
  }
});

// @desc    Create new floor
// @route   POST /api/floors
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), validateFloor, async (req, res) => {
  try {
    const floorData = {
      ...req.body,
      createdBy: req.user.id
    };

    const floor = await Floor.create(floorData);

    await floor.populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Floor created successfully',
      data: { floor }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating floor',
      error: error.message
    });
  }
});

// @desc    Update floor
// @route   PUT /api/floors/:id
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const allowedFields = [
      'name',
      'level',
      'description',
      'securityLevel',
      'capacity',
      'departments',
      'facilities',
      'emergencyExits',
      'accessPoints',
      'isActive',
      'requiresEscort',
      'operatingHours'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const floor = await Floor.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name');

    if (!floor) {
      return res.status(404).json({
        success: false,
        message: 'Floor not found'
      });
    }

    res.json({
      success: true,
      message: 'Floor updated successfully',
      data: { floor }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating floor',
      error: error.message
    });
  }
});

// @desc    Delete floor
// @route   DELETE /api/floors/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const floor = await Floor.findByIdAndDelete(req.params.id);

    if (!floor) {
      return res.status(404).json({
        success: false,
        message: 'Floor not found'
      });
    }

    res.json({
      success: true,
      message: 'Floor deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting floor',
      error: error.message
    });
  }
});

// @desc    Get accessible floors for user
// @route   GET /api/floors/accessible/:userId
// @access  Private
router.get('/accessible/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const floors = await Floor.findAccessibleForUser(userId);

    res.json({
      success: true,
      data: { floors }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching accessible floors',
      error: error.message
    });
  }
});

module.exports = router;