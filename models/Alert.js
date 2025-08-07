const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Alert type is required'],
    enum: ['security', 'compliance', 'system', 'emergency'],
    index: true
  },
  severity: {
    type: String,
    required: [true, 'Alert severity is required'],
    enum: ['low', 'medium', 'high', 'critical'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Alert title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Alert description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'acknowledged', 'resolved'],
    default: 'active',
    index: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  triggeredBy: {
    type: String,
    required: [true, 'Triggered by is required'],
    trim: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acknowledgedAt: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String
  }],
  escalationLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  autoResolve: {
    type: Boolean,
    default: false
  },
  resolveAfter: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for performance
alertSchema.index({ createdAt: -1 });
alertSchema.index({ type: 1, severity: 1 });
alertSchema.index({ status: 1, createdAt: -1 });
alertSchema.index({ assignedTo: 1, status: 1 });

// Virtual for response time
alertSchema.virtual('responseTime').get(function() {
  if (this.acknowledgedAt) {
    return this.acknowledgedAt - this.createdAt;
  }
  return null;
});

// Virtual for resolution time
alertSchema.virtual('resolutionTime').get(function() {
  if (this.resolvedAt) {
    return this.resolvedAt - this.createdAt;
  }
  return null;
});

// Pre-save middleware for auto-escalation
alertSchema.pre('save', function(next) {
  if (this.isNew && this.severity === 'critical') {
    // Auto-assign critical alerts to security team
    this.assignedTo = this.assignedTo || null;
  }
  next();
});

// Static method to get active alerts
alertSchema.statics.getActive = function() {
  return this.find({ status: 'active' }).sort({ createdAt: -1 });
};

// Static method to get critical alerts
alertSchema.statics.getCritical = function() {
  return this.find({ severity: 'critical', status: { $ne: 'resolved' } });
};

module.exports = mongoose.model('Alert', alertSchema);
