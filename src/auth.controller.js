const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

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

const login = async (req, res) => {
  // login logic...
};

module.exports = {
  login,
  getMe,
};
