const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

router.post('/seed-admin', async (req, res) => {
  try {
    const existing = await User.findOne({ email: 'admin@workguard360.com' });

    if (existing) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash('demo123', 12);

    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@workguard360.com',
      password: hashedPassword,
      role: 'admin',
      employeeId: 'ADM001',
      department: 'IT',
      phone: '+254712345678'
    });

    return res.status(201).json({ message: 'Admin created', user: admin });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal error' });
  }
});

module.exports = router;
