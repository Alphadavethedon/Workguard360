const express = require('express');
const router = express.Router();
const Violation = require('../models/Violation');

// GET all violations
router.get('/', async (req, res) => {
  try {
    const violations = await Violation.find();
    res.json(violations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new violation
router.post('/', async (req, res) => {
  const violation = new Violation({
    employeeId: req.body.employeeId,
    description: req.body.description,
    timestamp: req.body.timestamp || Date.now(),
    level: req.body.level || 'low',
  });

  try {
    const newViolation = await violation.save();
    res.status(201).json(newViolation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
