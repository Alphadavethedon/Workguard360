const mongoose = require('mongoose');

const floorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Floor name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  level: {
    type: Number,
    required: [true, 'Floor level is required']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  securityLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'restricted'],
    default: 'medium'
  },
  capacity: {
    type: Number,
    min: 1
  },
  departments: [{
    type: String,
    trim: true
  }],
  facilities: [{
    type: String,
    trim: true
  }],
  emergencyExits: [{
    name: String,
    location: String
  }],
  accessPoints: [{
    name: String,
    type: {
      type: String,
      enum: ['main', 'emergency', 'service'],
      default: 'main'
    },
    deviceId: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  requiresEscort: {
    type: Boolean,
    default: false
  },
  operatingHours: {
    start: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    end: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Indexes
floorSchema.index({ level: 1 });
floorSchema.index({ securityLevel: 1 });
floorSchema.index({ isActive: 1 });

// Virtual for current occupancy (would need real-time data)
floorSchema.virtual('currentOccupancy').get(function() {
  // This would be calculated from current access logs
  return 0;
});

// Instance method to check if floor is accessible at current time
floorSchema.methods.isAccessibleNow = function() {
  if (!this.isActive) return false;
  
  if (!this.operatingHours.start || !this.operatingHours.end) {
    return true; // 24/7 access
  }
  
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  
  const start = this.operatingHours.start;
  const end = this.operatingHours.end;
  
  // Handle overnight hours
  if (end < start) {
    return currentTime >= start || currentTime <= end;
  }
  
  return currentTime >= start && currentTime <= end;
};

// Static method to find accessible floors for user
floorSchema.statics.findAccessibleForUser = function(userId) {
  return this.find({
    isActive: true,
    $or: [
      { securityLevel: { $in: ['low', 'medium'] } },
      { authorizedUsers: userId }
    ]
  });
};

module.exports = mongoose.model('Floor', floorSchema);