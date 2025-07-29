const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Mock training data (in production, use proper models)
let trainings = [];

// @desc    Get all trainings
// @route   GET /api/training
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    let filteredTrainings = trainings.filter(training => training.isActive);

    // Apply filters
    if (req.query.category) {
      filteredTrainings = filteredTrainings.filter(training => 
        training.category === req.query.category
      );
    }
    if (req.query.type) {
      filteredTrainings = filteredTrainings.filter(training => 
        training.type === req.query.type
      );
    }

    const total = filteredTrainings.length;
    const paginatedTrainings = filteredTrainings.slice(startIndex, startIndex + limit);

    res.status(200).json({
      success: true,
      count: paginatedTrainings.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      data: paginatedTrainings
    });

  } catch (error) {
    logger.error('Get trainings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trainings'
    });
  }
});

// @desc    Get single training
// @route   GET /api/training/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const training = trainings.find(t => t.id === req.params.id);

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training not found'
      });
    }

    // Check if user is enrolled or has permission to view
    const isEnrolled = training.enrollments.some(
      enrollment => enrollment.userId === req.user.id
    );

    const hasPermission = ['manager', 'safety_officer', 'admin'].includes(req.user.role);

    if (!isEnrolled && !hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this training'
      });
    }

    res.status(200).json({
      success: true,
      data: training
    });

  } catch (error) {
    logger.error('Get training error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching training'
    });
  }
});

// @desc    Create new training
// @route   POST /api/training
// @access  Private (Safety Officer, Manager, Admin)
router.post('/', protect, authorize('safety_officer', 'manager', 'admin'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(['safety', 'security', 'compliance', 'emergency_response', 'equipment', 'general']).withMessage('Invalid category'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive number'),
  body('content').isArray({ min: 1 }).withMessage('Training content is required')
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

    const training = {
      id: Date.now().toString(),
      ...req.body,
      instructor: req.user.id,
      createdAt: new Date(),
      enrollments: [],
      isActive: true
    };

    trainings.push(training);

    logger.info(`Training created: ${training.id} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: training
    });

  } catch (error) {
    logger.error('Create training error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating training'
    });
  }
});

// @desc    Enroll in training
// @route   POST /api/training/:id/enroll
// @access  Private
router.post('/:id/enroll', protect, async (req, res) => {
  try {
    const trainingIndex = trainings.findIndex(t => t.id === req.params.id);

    if (trainingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Training not found'
      });
    }

    const training = trainings[trainingIndex];

    // Check if already enrolled
    const existingEnrollment = training.enrollments.find(
      enrollment => enrollment.userId === req.user.id
    );

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this training'
      });
    }

    // Add enrollment
    training.enrollments.push({
      userId: req.user.id,
      enrolledAt: new Date(),
      status: 'enrolled',
      progress: 0
    });

    trainings[trainingIndex] = training;

    logger.info(`User enrolled in training: ${req.user.email} -> ${training.id}`);

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in training'
    });

  } catch (error) {
    logger.error('Enroll training error:', error);
    res.status(500).json({
      success: false,
      message: 'Error enrolling in training'
    });
  }
});

// @desc    Update training progress
// @route   PUT /api/training/:id/progress
// @access  Private
router.put('/:id/progress', protect, [
  body('progress').isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
  body('score').optional().isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100')
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

    const trainingIndex = trainings.findIndex(t => t.id === req.params.id);

    if (trainingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Training not found'
      });
    }

    const training = trainings[trainingIndex];
    const enrollmentIndex = training.enrollments.findIndex(
      enrollment => enrollment.userId === req.user.id
    );

    if (enrollmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Not enrolled in this training'
      });
    }

    const enrollment = training.enrollments[enrollmentIndex];

    // Update progress
    enrollment.progress = req.body.progress;
    if (!enrollment.startedAt && req.body.progress > 0) {
      enrollment.startedAt = new Date();
      enrollment.status = 'in_progress';
    }

    // Handle completion
    if (req.body.progress === 100) {
      enrollment.completedAt = new Date();
      enrollment.status = 'completed';
      
      if (req.body.score !== undefined) {
        enrollment.score = req.body.score;
        enrollment.passed = req.body.score >= (training.passingScore || 80);
      }
    }

    trainings[trainingIndex] = training;

    logger.info(`Training progress updated: ${req.user.email} -> ${training.id} (${req.body.progress}%)`);

    res.status(200).json({
      success: true,
      data: enrollment
    });

  } catch (error) {
    logger.error('Update training progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating training progress'
    });
  }
});

// @desc    Get training statistics
// @route   GET /api/training/stats
// @access  Private (Safety Officer, Manager, Admin)
router.get('/stats', protect, authorize('safety_officer', 'manager', 'admin'), async (req, res) => {
  try {
    const totalTrainings = trainings.filter(t => t.isActive).length;
    const totalEnrollments = trainings.reduce((acc, training) => 
      acc + training.enrollments.length, 0
    );

    const completionStats = trainings.reduce((acc, training) => {
      training.enrollments.forEach(enrollment => {
        acc[enrollment.status] = (acc[enrollment.status] || 0) + 1;
      });
      return acc;
    }, {});

    const categoryStats = trainings.reduce((acc, training) => {
      acc[training.category] = (acc[training.category] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalTrainings,
          totalEnrollments
        },
        distributions: {
          completionStats,
          categoryStats
        }
      }
    });

  } catch (error) {
    logger.error('Get training stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching training statistics'
    });
  }
});

module.exports = router;