const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Permission name is required'],
    unique: true,
    trim: true
  },
  resource: {
    type: String,
    required: [true, 'Resource is required'],
    enum: ['user', 'alert', 'report', 'dashboard', 'system', 'role', 'permission']
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: ['create', 'read', 'update', 'delete', 'manage', 'execute']
  },
  description: {
    type: String,
    required: [true, 'Permission description is required'],
    trim: true
  }
}, {
  timestamps: true
});

// Compound index for resource and action
permissionSchema.index({ resource: 1, action: 1 });

module.exports = mongoose.model('Permission', permissionSchema);
