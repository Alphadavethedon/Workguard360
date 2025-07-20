const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Alert title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Alert message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['security', 'violation', 'system', 'maintenance'],
    required: [true, 'Alert type is required']
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved', 'archived'],
    default: 'active'
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedAccessLog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccessLog'
  },
  relatedFloor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Floor'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  resolution: {
    type: String,
    trim: true
  },
  metadata: {
    deviceId: String,
    location: String,
    additionalInfo: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
alertSchema.index({ status: 1, createdAt: -1 });
alertSchema.index({ type: 1, severity: 1 });
alertSchema.index({ assignedTo: 1, status: 1 });
alertSchema.index({ createdBy: 1 });
alertSchema.index({ relatedUser: 1 });

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

// Pre-save middleware
alertSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get active alerts
alertSchema.statics.getActive = function() {
  return this.find({ status: { $in: ['active', 'acknowledged'] } })
    .populate('relatedUser', 'name employeeId')
    .populate('assignedTo', 'name')
    .populate('relatedFloor', 'name level')
    .sort({ severity: -1, createdAt: -1 });
};

// Static method to get alerts by severity
alertSchema.statics.getBySeverity = function(severity) {
  return this.find({ severity, status: { $ne: 'archived' } })
    .populate('relatedUser', 'name employeeId')
    .sort({ createdAt: -1 });
};

// Instance method to acknowledge alert
alertSchema.methods.acknowledge = function(userId) {
  this.status = 'acknowledged';
  this.acknowledgedBy = userId;
  this.acknowledgedAt = new Date();
  return this.save();
};

// Instance method to resolve alert
alertSchema.methods.resolve = function(userId, resolution) {
  this.status = 'resolved';
  this.resolvedBy = userId;
  this.resolvedAt = new Date();
  if (resolution) this.resolution = resolution;
  return this.save();
};

module.exports = mongoose.model('Alert', alertSchema);