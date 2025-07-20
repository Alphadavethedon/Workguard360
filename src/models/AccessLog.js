const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required']
  },
  floor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Floor',
    required: [true, 'Floor is required']
  },
  accessType: {
    type: String,
    enum: ['entry', 'exit'],
    required: [true, 'Access type is required']
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  deviceId: {
    type: String,
    trim: true
  },
  accessMethod: {
    type: String,
    enum: ['card', 'biometric', 'pin', 'manual'],
    default: 'card'
  },
  isAuthorized: {
    type: Boolean,
    default: true
  },
  violationType: {
    type: String,
    enum: ['floor_breach', 'shift_violation', 'unauthorized_access'],
    required: function() {
      return !this.isAuthorized;
    }
  },
  notes: {
    type: String,
    trim: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  location: {
    latitude: Number,
    longitude: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
accessLogSchema.index({ user: 1, timestamp: -1 });
accessLogSchema.index({ floor: 1, timestamp: -1 });
accessLogSchema.index({ employeeId: 1, timestamp: -1 });
accessLogSchema.index({ timestamp: -1 });
accessLogSchema.index({ isAuthorized: 1 });
accessLogSchema.index({ violationType: 1 });

// Virtual for duration (if exit follows entry)
accessLogSchema.virtual('duration').get(function() {
  // This would be calculated based on entry/exit pairs
  return null;
});

// Static method to get recent logs
accessLogSchema.statics.getRecent = function(limit = 50) {
  return this.find()
    .populate('user', 'name employeeId department')
    .populate('floor', 'name level')
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get violations
accessLogSchema.statics.getViolations = function(startDate, endDate) {
  const query = { isAuthorized: false };
  
  if (startDate && endDate) {
    query.timestamp = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.find(query)
    .populate('user', 'name employeeId department')
    .populate('floor', 'name level')
    .sort({ timestamp: -1 });
};

// Static method to get user access history
accessLogSchema.statics.getUserHistory = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    user: userId,
    timestamp: { $gte: startDate }
  })
    .populate('floor', 'name level')
    .sort({ timestamp: -1 });
};

module.exports = mongoose.model('AccessLog', accessLogSchema);