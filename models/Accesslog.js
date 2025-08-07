// models/AccessLog.js

const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['ENTRY', 'EXIT', 'DENIED', 'ALERT'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  floor: {
    type: String,
    default: 'Unknown'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AccessLog', accessLogSchema);
