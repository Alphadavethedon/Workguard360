const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
    enum: ['Super Admin', 'Admin', 'Security Manager', 'HR Manager', 'Employee']
  },
  description: {
    type: String,
    required: [true, 'Role description is required'],
    trim: true
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission'
  }],
  isCustom: {
    type: Boolean,
    default: false
  },
  accessLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  }
}, {
  timestamps: true
});

// Index for performance
roleSchema.index({ name: 1 });

module.exports = mongoose.model('Role', roleSchema);
