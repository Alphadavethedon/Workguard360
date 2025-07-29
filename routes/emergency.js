const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Emergency contacts and procedures
const emergencyContacts = {
  fire: '911',
  medical: '911',
  police: '911',
  security: '+1-555-0123',
  facilities: '+1-555-0124',
  management: '+1-555-0125'
};

const emergencyProcedures = {
  fire: {
    title: 'Fire Emergency',
    steps: [
      'Pull the nearest fire alarm',
      'Evacuate immediately using nearest exit',
      'Do not use elevators',
      'Proceed to designated assembly point',
      'Await further instructions from emergency personnel'
    ]
  },
  medical: {
    title: 'Medical Emergency',
    steps: [
      'Call 911 immediately',
      'Do not move injured person unless in immediate danger',
      'Apply first aid if trained',
      'Notify security and management',
      'Wait for emergency medical services'
    ]
  },
  evacuation: {
    title: 'Building Evacuation',
    steps: [
      'Remain calm and listen for instructions',
      'Use nearest emergency exit',
      'Do not use elevators',
      'Assist those who need help if safe to do so',
      'Report to designated assembly point'
    ]
  },
  chemical: {
    title: 'Chemical Spill',
    steps: [
      'Evacuate immediate area',
      'Alert others in the vicinity',
      'Call emergency services if necessary',
      'Notify facilities management',
      'Do not attempt cleanup unless trained'
    ]
  }
};

// @desc    Get emergency contacts
// @route   GET /api/emergency/contacts
// @access  Private
router.get('/contacts', protect, (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: emergencyContacts
    });
  } catch (error) {
    logger.error('Get emergency contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching emergency contacts'
    });
  }
});

// @desc    Get emergency procedures
// @route   GET /api/emergency/procedures
// @access  Private
router.get('/procedures', protect, (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: emergencyProcedures
    });
  } catch (error) {
    logger.error('Get emergency procedures error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching emergency procedures'
    });
  }
});

// @desc    Report emergency
// @route   POST /api/emergency/report
// @access  Private
router.post('/report', protect, [
  body('type').isIn(['fire', 'medical', 'security', 'chemical', 'other']).withMessage('Invalid emergency type'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('severity').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity level')
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

    const emergencyReport = {
      id: Date.now().toString(),
      type: req.body.type,
      description: req.body.description,
      location: req.body.location,
      severity: req.body.severity,
      reportedBy: req.user.id,
      reportedAt: new Date(),
      coordinates: req.body.coordinates,
      status: 'active'
    };

    // Send immediate real-time alert to all connected users
    const io = req.app.get('io');
    io.emit('emergency-alert', {
      emergency: emergencyReport,
      message: `🚨 EMERGENCY ALERT: ${req.body.type.toUpperCase()} at ${req.body.location}`,
      priority: 'critical'
    });

    // Log emergency report with high priority
    logger.error(`🚨 EMERGENCY REPORTED: ${req.body.type} at ${req.body.location} by ${req.user.email}`, {
      emergency: emergencyReport,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Emergency reported successfully. Authorities have been notified.',
      data: emergencyReport
    });

  } catch (error) {
    logger.error('Report emergency error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reporting emergency'
    });
  }
});

// @desc    Get evacuation status
// @route   GET /api/emergency/evacuation/status
// @access  Private
router.get('/evacuation/status', protect, (req, res) => {
  try {
    // In a real system, this would check building sensors, access cards, etc.
    const evacuationStatus = {
      active: false,
      startTime: null,
      estimatedCompletion: null,
      evacuated: 0,
      remaining: 0,
      zones: [
        { name: 'Building A - Floor 1', status: 'clear', evacuated: 45, remaining: 0 },
        { name: 'Building A - Floor 2', status: 'clear', evacuated: 38, remaining: 0 },
        { name: 'Building B - Floor 1', status: 'in_progress', evacuated: 22, remaining: 8 },
        { name: 'Parking Garage', status: 'clear', evacuated: 15, remaining: 0 }
      ]
    };

    res.status(200).json({
      success: true,
      data: evacuationStatus
    });

  } catch (error) {
    logger.error('Get evacuation status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching evacuation status'
    });
  }
});

module.exports = router;