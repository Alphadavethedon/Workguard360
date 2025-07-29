const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Training title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Training description is required']
  },
  category: {
    type: String,
    required: true,
    enum: ['safety', 'security', 'compliance', 'emergency_response', 'equipment', 'general']
  },
  type: {
    type: String,
    enum: ['mandatory', 'optional', 'refresher'],
    default: 'mandatory'
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Training duration is required']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  content: [{
    module: String,
    description: String,
    videoUrl: String,
    documentUrl: String,
    quiz: [{
      question: String,
      options: [String],
      correctAnswer: Number
    }]
  }],
  targetAudience: {
    departments: [String],
    roles: [String],
    specificUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  schedule: {
    startDate: Date,
    endDate: Date,
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurringPattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'annually']
    }
  },
  enrollments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['enrolled', 'in_progress', 'completed', 'failed'],
      default: 'enrolled'
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    startedAt: Date,
    completedAt: Date,
    score: Number,
    attempts: [{
      attemptDate: Date,
      score: Number,
      passed: Boolean
    }]
  }],
  passingScore: {
    type: Number,
    default: 80,
    min: 0,
    max: 100
  },
  certificateTemplate: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
trainingSchema.index({ category: 1, type: 1 });
trainingSchema.index({ 'targetAudience.departments': 1 });
trainingSchema.index({ 'enrollments.user': 1, 'enrollments.status': 1 });

module.exports = mongoose.model('Training', trainingSchema);