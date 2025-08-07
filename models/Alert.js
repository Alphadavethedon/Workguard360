const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Alert title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Alert description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  type: {
    type: String,
    required: [true, 'Alert type is required'],
    enum: {
      values: [
        'security_breach',
        'unauthorized_access',
        'system_failure',
        'maintenance_required',
        'policy_violation',
        'emergency',
        'suspicious_activity',
        'equipment_malfunction',
        'access_denied',
        'data_breach'
      ],
      message: 'Alert type must be a valid type'
    }
  },
  severity: {
    type: String,
    required: [true, 'Alert severity is required'],
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: 'Severity must be low, medium, high, or critical'
    },
    default: 'medium'
  },
  status: {
    type: String,
    enum: {
      values: ['open', 'in_progress', 'resolved', 'closed', 'dismissed'],
      message: 'Status must be open, in_progress, resolved, closed, or dismissed'
    },
    default: 'open'
  },
  location: {
    building: {
      type: String,
      required: true,
      trim: true
    },
    floor: {
      type: String,
      trim: true
    },
    room: {
      type: String,
      trim: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reported by user is required']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Comment cannot be more than 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  timeline: [{
    action: {
      type: String,
      required: true,
      enum: [
        'created',
        'updated',
        'assigned',
        'status_changed',
        'comment_added',
        'attachment_added',
        'resolved',
        'closed'
      ]
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    description: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  }],
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolution: {
    type: String,
    trim: true,
    maxlength: [1000, 'Resolution cannot be more than 1000 characters']
  },
  estimatedResolutionTime: Date,
  actualResolutionTime: Date,
  notificationsSent: [{
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    method: {
      type: String,
      enum: ['email', 'sms', 'push', 'in_app']
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed'],
      default: 'sent'
    }
  }],
  isUrgent: {
    type: Boolean,
    default: false
  },
  requiresApproval: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
AlertSchema.index({ status: 1, severity: 1 });
AlertSchema.index({ reportedBy: 1 });
AlertSchema.index({ assignedTo: 1 });
AlertSchema.index({ type: 1 });
AlertSchema.index({ department: 1 });
AlertSchema.index({ createdAt: -1 });
AlertSchema.index({ 'location.building': 1 });

// Virtual for age of alert
AlertSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Virtual for time to resolution
AlertSchema.virtual('timeToResolution').get(function() {
  if (this.resolvedAt) {
    return this.resolvedAt.getTime() - this.createdAt.getTime();
  }
  return null;
});

// Virtual for is overdue
AlertSchema.virtual('isOverdue').get(function() {
  if (this.estimatedResolutionTime && !this.resolvedAt) {
    return Date.now() > this.estimatedResolutionTime.getTime();
  }
  return false;
});

// Pre-save middleware to update timeline
AlertSchema.pre('save', function(next) {
  if (this.isNew) {
    this.timeline.push({
      action: 'created',
      user: this.reportedBy,
      description: 'Alert created'
    });
  } else {
    // Track status changes
    if (this.isModified('status')) {
      this.timeline.push({
        action: 'status_changed',
        user: this.assignedTo || this.reportedBy,
        description: `Status changed to ${this.status}`,
        oldValue: this.$originalStatus,
        newValue: this.status
      });
    }

    // Track assignment changes
    if (this.isModified('assignedTo')) {
      this.timeline.push({
        action: 'assigned',
        user: this.assignedTo,
        description: 'Alert assigned'
      });
    }

    // Mark as resolved
    if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
      this.resolvedAt = new Date();
      this.actualResolutionTime = Date.now() - this.createdAt.getTime();
    }
  }
  next();
});

// Method to add comment
AlertSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    user: userId,
    content: content
  });
  
  this.timeline.push({
    action: 'comment_added',
    user: userId,
    description: 'Comment added'
  });
  
  return this.save();
};

// Static method to get alerts by severity
AlertSchema.statics.getBySeverity = function(severity) {
  return this.find({ severity }).populate('reportedBy assignedTo', 'name email employeeId');
};

// Static method to get recent alerts
AlertSchema.statics.getRecent = function(limit = 10) {
  return this.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('reportedBy assignedTo', 'name email employeeId');
};

module.exports = mongoose.model('Alert', AlertSchema);