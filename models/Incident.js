const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  incidentNumber: {
    type: String,
    required: true,
    unique: true // ✅ Keep this, but remove separate index declarations
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['safety', 'security', 'HR', 'IT', 'maintenance'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  department: {
    type: String
  },
  location: {
    building: String,
    floor: String
  },
  dateTimeOccurred: {
    type: Date,
    required: true
  },
  attachments: [{
    type: String
  }],
  resolution: {
    notes: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date
  }
}, {
  timestamps: true
});

// ✅ Keep performance-related indexes only
incidentSchema.index({ reportedBy: 1, createdAt: -1 });
incidentSchema.index({ category: 1, severity: 1 });
incidentSchema.index({ status: 1, priority: 1 });
incidentSchema.index({ dateTimeOccurred: -1 });

module.exports = mongoose.model('Incident', incidentSchema);
