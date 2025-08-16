// controllers/authController.js
'use strict';

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function signToken(payload, expiresIn = process.env.JWT_EXPIRE || '30d') {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set');
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

exports.login = async (req, res, next) => {
  try {
    const { email = '', password = '' } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password || '');
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken({ id: user._id.toString() });

    const safeUser = { id: user._id, email: user.email, firstName: user.firstName || '', lastName: user.lastName || '', role: user.role || 'user' };
    return res.status(200).json({ user: safeUser, token });
  } catch (err) {
    return next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const safeUser = { id: user._id, email: user.email, firstName: user.firstName || '', lastName: user.lastName || '', role: user.role || 'user' };
    return res.status(200).json({ user: safeUser });
  } catch (err) {
    return next(err);
  }
};
