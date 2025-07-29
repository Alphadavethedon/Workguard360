const mongoose = require('mongoose');

const safetyComplianceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Compliance title is required'],
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['safety_inspection', 'audit', 'training_requirement', 'equipment_check', 'policy_review']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'overdue'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  checklist: [{
    item: {
      type: String,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: Date,
    comments: String
  }],
  findings: [{
    finding: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    correctiveAction: String,
    dueDate: Date,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed'],
      default: 'open'
    }
  }],
  attachments: [{
    filename: String,
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completedAt: Date,
  nextDueDate: Date
}, {
  timestamps: true
});

// Indexes
safetyComplianceSchema.index({ assignedTo: 1, status: 1 });
safetyComplianceSchema.index({ dueDate: 1, status: 1 });
safetyComplianceSchema.index({ department: 1, type: 1 });

module.exports = mongoose.model('SafetyCompliance', safetyComplianceSchema);