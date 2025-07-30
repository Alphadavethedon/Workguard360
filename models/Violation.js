const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  level: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low',
  },
});

const Violation = mongoose.model('Violation', violationSchema);
module.exports = Violation;
