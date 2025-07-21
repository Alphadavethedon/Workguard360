// src/controllers/auth.controller.js

const User = require('../models/user.model'); // Make sure User is imported
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  // Your login logic...
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('role');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      id: user._id,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Export both
module.exports = {
  login,
  getMe,
};
