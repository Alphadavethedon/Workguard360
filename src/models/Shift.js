const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Shift name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
  },
  days: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true
  }],
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  allowedOvertime: {
    type: Number,
    default: 30, // minutes
    min: 0
  },
  breakDuration: {
    type: Number,
    default: 60, // minutes
    min: 0
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
shiftSchema.index({ name: 1 });
shiftSchema.index({ isActive: 1 });

// Virtual for duration in minutes
shiftSchema.virtual('duration').get(function() {
  const start = this.startTime.split(':');
  const end = this.endTime.split(':');
  
  const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
  let endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
  
  // Handle overnight shifts
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }
  
  return endMinutes - startMinutes;
});

// Instance method to check if current time is within shift
shiftSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const currentTime = now.toTimeString().slice(0, 5);
  
  if (!this.days.includes(currentDay)) {
    return false;
  }
  
  const start = this.startTime;
  const end = this.endTime;
  
  // Handle overnight shifts
  if (end < start) {
    return currentTime >= start || currentTime <= end;
  }
  
  return currentTime >= start && currentTime <= end;
};

// Static method to find active shifts
shiftSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

module.exports = mongoose.model('Shift', shiftSchema);