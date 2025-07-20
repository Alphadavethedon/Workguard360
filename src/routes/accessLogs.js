const express = require('express');
const AccessLog = require('../models/AccessLog');
const User = require('../models/User');
const Floor = require('../models/Floor');
const Alert = require('../models/Alert');
const { protect, authorize } = require('../middleware/auth');
const { validateAccessLog, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @desc    Create access log entry
// @route   POST /api/access-logs
// @access  Private
router.post('/', protect, validateAccessLog, async (req, res) => {
  try {
    const {
      employeeId,
      floor: floorId,
      accessType,
      accessMethod,
      deviceId,
      notes
    } = req.body;

    // Find user by employee ID
    const user = await User.findOne({ employeeId }).populate('authorizedFloors shift');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Find floor
    const floor = await Floor.findById(floorId);
    
    if (!floor) {
      return res.status(404).json({
        success: false,
        message: 'Floor not found'
      });
    }

    // Check authorization
    let isAuthorized = true;
    let violationType = null;

    // Check if user is authorized for this floor
    const isFloorAuthorized = user.authorizedFloors.some(
      authorizedFloor => authorizedFloor._id.toString() === floorId
    );

    if (!isFloorAuthorized && floor.securityLevel !== 'low') {
      isAuthorized = false;
      violationType = 'floor_breach';
    }

    // Check shift timing if user has a shift
    if (user.shift && isAuthorized) {
      const currentTime = new Date().toTimeString().slice(0, 5);
      const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
      
      const shiftActive = user.shift.days.includes(currentDay) &&
        user.shift.isCurrentlyActive();
      
      if (!shiftActive) {
        isAuthorized = false;
        violationType = 'shift_violation';
      }
    }

    // Create access log
    const accessLog = await AccessLog.create({
      user: user._id,
      employeeId,
      floor: floorId,
      accessType,
      accessMethod: accessMethod || 'card',
      deviceId,
      notes,
      isAuthorized,
      violationType,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Populate the created log
    await accessLog.populate([
      { path: 'user', select: 'name employeeId department' },
      { path: 'floor', select: 'name level securityLevel' }
    ]);

    // Create alert for violations
    if (!isAuthorized) {
      const alertTitle = violationType === 'floor_breach' 
        ? 'Unauthorized Floor Access'
        : 'Shift Violation Detected';
      
      const alertMessage = `${user.name} (${employeeId}) attempted ${accessType} to ${floor.name} - ${violationType.replace('_', ' ')}`;

      await Alert.create({
        title: alertTitle,
        message: alertMessage,
        type: 'violation',
        severity: floor.securityLevel === 'restricted' ? 'critical' : 'high',
        relatedUser: user._id,
        relatedAccessLog: accessLog._id,
        relatedFloor: floorId,
        createdBy: req.user.id
      });

      // Emit real-time alert via Socket.IO
      const io = req.app.get('io');
      io.emit('security-alert', {
        type: 'violation',
        message: alertMessage,
        severity: floor.securityLevel === 'restricted' ? 'critical' : 'high',
        timestamp: new Date()
      });
    }

    // Emit real-time access log update
    const io = req.app.get('io');
    io.emit('access-log-update', accessLog);

    res.status(201).json({
      success: true,
      message: 'Access log created successfully',
      data: { accessLog }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating access log',
      error: error.message
    });
  }
});

// @desc    Get access logs
// @route   GET /api/access-logs
// @access  Private
router.get('/', protect, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      query.timestamp = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    // Filter by user
    if (req.query.userId) {
      query.user = req.query.userId;
    }

    // Filter by employee ID
    if (req.query.employeeId) {
      query.employeeId = req.query.employeeId;
    }

    // Filter by floor
    if (req.query.floorId) {
      query.floor = req.query.floorId;
    }

    // Filter by access type
    if (req.query.accessType) {
      query.accessType = req.query.accessType;
    }

    // Filter by authorization status
    if (req.query.isAuthorized !== undefined) {
      query.isAuthorized = req.query.isAuthorized === 'true';
    }

    // Filter by violation type
    if (req.query.violationType) {
      query.violationType = req.query.violationType;
    }

    const accessLogs = await AccessLog.find(query)
      .populate('user', 'name employeeId department')
      .populate('floor', 'name level securityLevel')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AccessLog.countDocuments(query);

    res.json({
      success: true,
      data: {
        accessLogs,
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
      message: 'Error fetching access logs',
      error: error.message
    });
  }
});

// @desc    Get access log by ID
// @route   GET /api/access-logs/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const accessLog = await AccessLog.findById(req.params.id)
      .populate('user', 'name employeeId department phoneNumber')
      .populate('floor', 'name level securityLevel description');

    if (!accessLog) {
      return res.status(404).json({
        success: false,
        message: 'Access log not found'
      });
    }

    res.json({
      success: true,
      data: { accessLog }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching access log',
      error: error.message
    });
  }
});

// @desc    Get user access history
// @route   GET /api/access-logs/user/:userId/history
// @access  Private
router.get('/user/:userId/history', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days) || 30;

    const accessLogs = await AccessLog.getUserHistory(userId, days);

    res.json({
      success: true,
      data: { accessLogs }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user access history',
      error: error.message
    });
  }
});

// @desc    Get violations
// @route   GET /api/access-logs/violations
// @access  Private (Security/Admin only)
router.get('/violations', protect, authorize('admin', 'security'), async (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const violations = await AccessLog.getViolations(startDate, endDate);

    res.json({
      success: true,
      data: { violations }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching violations',
      error: error.message
    });
  }
});

// @desc    Bulk create access logs (for simulation)
// @route   POST /api/access-logs/bulk
// @access  Private (Admin only)
router.post('/bulk', protect, authorize('admin'), async (req, res) => {
  try {
    const { logs } = req.body;

    if (!Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Logs array is required'
      });
    }

    const createdLogs = await AccessLog.insertMany(logs);

    // Emit real-time updates
    const io = req.app.get('io');
    io.emit('bulk-access-logs', createdLogs);

    res.status(201).json({
      success: true,
      message: `${createdLogs.length} access logs created successfully`,
      data: { count: createdLogs.length }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating bulk access logs',
      error: error.message
    });
  }
});

module.exports = router;