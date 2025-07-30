const express = require('express');
const router = express.Router();
const Log = require('../models/Log');

// GET all logs
router.get('/', async (req, res) => {
  try {
    const logs = await Log.find();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new log
router.post('/', async (req, res) => {
  const log = new Log({
    employeeId: req.body.employeeId,
    action: req.body.action,
    timestamp: req.body.timestamp || Date.now(),
    status: req.body.status,
  });

  try {
    const newLog = await log.save();
    res.status(201).json(newLog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
