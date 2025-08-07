const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  badgeNumber: {
    type: String,
    required: true,
    index: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    index: true
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: ['entry', 'exit', 'denied'],
    index: true
  },
  deviceId: {
    type: String,
    required: [true, 'Device ID is required'],
    trim: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  success: {
    type: Boolean,
    required: true,
    default: true,
    index: true
  },
  reason: {
    type: String,
    trim: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  duration: {
    type: Number, // Duration in minutes for entry/exit pairs
    min: 0
  },
  exitLog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccessLog'
  }
}, {
  timestamps: true
});

// Indexes for performance
accessLogSchema.index({ createdAt: -1 });
accessLogSchema.index({ user: 1, createdAt: -1 });
accessLogSchema.index({ location: 1, createdAt: -1 });
accessLogSchema.index({ action: 1, success: 1 });

// Virtual for user name (populated)
accessLogSchema.virtual('userName').get(function() {
  if (this.user && typeof this.user === 'object') {
    return `${this.user.firstName} ${this.user.lastName}`;
  }
  return 'Unknown User';
});

// Static method to get today's entries
accessLogSchema.statics.getTodayEntries = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.countDocuments({
    action: 'entry',
    success: true,
    createdAt: { $gte: today, $lt: tomorrow }
  });
};

// Static method to get failed access attempts
accessLogSchema.statics.getFailedAttempts = function(timeframe = 24) {
  const since = new Date(Date.now() - timeframe * 60 * 60 * 1000);
  
  return this.find({
    success: false,
    createdAt: { $gte: since }
  }).populate('user', 'firstName lastName email');
};

module.exports = mongoose.model('AccessLog', accessLogSchema);
