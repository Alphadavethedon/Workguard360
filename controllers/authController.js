const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.login = async (req, res) => {
  
};

exports.getMe = async (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (err) {
    console.error('GetMe failed:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
