const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Report name is required'],
    trim: true,
    maxlength: [200, 'Report name cannot exceed 200 characters']
  },
  type: {
    type: String,
    required: [true, 'Report type is required'],
    enum: ['access', 'compliance', 'security', 'attendance', 'system', 'custom'],
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  dateRange: {
    start: {
      type: Date,
      required: [true, 'Start date is required']
    },
    end: {
      type: Date,
      required: [true, 'End date is required']
    }
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['generating', 'ready', 'failed', 'expired'],
    default: 'generating',
    index: true
  },
  format: {
    type: String,
    enum: ['pdf', 'csv', 'excel', 'json'],
    default: 'pdf'
  },
  filePath: {
    type: String
  },
  fileSize: {
    type: Number,
    min: 0
  },
  downloadCount: {
    type: Number,
    default: 0,
    min: 0
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
  },
  filters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  error: {
    type: String
  },
  isScheduled: {
    type: Boolean,
    default: false
  },
  schedule: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly']
    },
    nextRun: Date,
    lastRun: Date
  }
}, {
  timestamps: true
});

// Indexes for performance
reportSchema.index({ createdAt: -1 });
reportSchema.index({ generatedBy: 1, createdAt: -1 });
reportSchema.index({ type: 1, status: 1 });
reportSchema.index({ expiresAt: 1 });

// Virtual for download URL
reportSchema.virtual('downloadUrl').get(function() {
  if (this.filePath && this.status === 'ready') {
    return `/api/reports/${this._id}/download`;
  }
  return null;
});

// Pre-save middleware to validate date range
reportSchema.pre('save', function(next) {
  if (this.dateRange.start >= this.dateRange.end) {
    next(new Error('Start date must be before end date'));
  } else {
    next();
  }
});

// Static method to cleanup expired reports
reportSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() },
    status: { $in: ['ready', 'failed'] }
  });
};

// Method to increment download count
reportSchema.methods.incrementDownload = function() {
  this.downloadCount += 1;
  return this.save();
};

module.exports = mongoose.model('Report', reportSchema);
