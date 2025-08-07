const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    enum: {
      values: [
        'Security',
        'IT',
        'HR',
        'Finance',
        'Operations',
        'Management',
        'Facilities',
        'Legal',
        'Marketing',
        'Sales'
      ],
      message: 'Department must be a valid department'
    }
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'security_manager', 'security_guard', 'employee'],
      message: 'Role must be admin, security_manager, security_guard, or employee'
    },
    default: 'employee'
  },
  permissions: [{
    type: String,
    enum: [
      'read_users',
      'write_users',
      'delete_users',
      'read_alerts',
      'write_alerts',
      'delete_alerts',
      'read_reports',
      'write_reports',
      'read_dashboard',
      'manage_system'
    ]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  profileImage: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'US'
    }
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  accessLevel: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  badgeNumber: {
    type: String,
    sparse: true,
    unique: true
  },
  hireDate: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ employeeId: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ department: 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual for account locked
UserSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to set permissions based on role
UserSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    switch (this.role) {
      case 'admin':
        this.permissions = [
          'read_users', 'write_users', 'delete_users',
          'read_alerts', 'write_alerts', 'delete_alerts',
          'read_reports', 'write_reports',
          'read_dashboard', 'manage_system'
        ];
        this.accessLevel = 5;
        break;
      case 'security_manager':
        this.permissions = [
          'read_users', 'write_users',
          'read_alerts', 'write_alerts',
          'read_reports', 'write_reports',
          'read_dashboard'
        ];
        this.accessLevel = 4;
        break;
      case 'security_guard':
        this.permissions = [
          'read_alerts', 'write_alerts',
          'read_reports',
          'read_dashboard'
        ];
        this.accessLevel = 3;
        break;
      case 'employee':
        this.permissions = ['read_dashboard'];
        this.accessLevel = 1;
        break;
    }
  }
  next();
});

// Method to increment login attempts
UserSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: {
        loginAttempts: 1,
      },
      $unset: {
        lockUntil: 1
      }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
    };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
UserSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1
    }
  });
};

module.exports = mongoose.model('User', UserSchema);