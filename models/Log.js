const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'pending'],
    default: 'pending',
  },
});

const Log = mongoose.model('Log', logSchema);
module.exports = Log;
