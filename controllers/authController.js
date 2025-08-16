'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// helper to sign JWTs safely
function signAccessToken(payload, expiresIn = process.env.JWT_EXPIRE || '30d') {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET missing');
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
exports.login = async (req, res, next) => {
  try {
    const { email = '', password = '' } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing credentials' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const ok = await bcrypt.compare(password, user.password || '');
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

    const token = signAccessToken({ id: user._id.toString() });

    // build safe user payload
    const safeUser = {
      id: user._id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role || 'user',
    };

    return res.status(200).json({ user: safeUser, token });
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/auth/me
 * Requires Authorization: Bearer <token>
 * Returns the current user's safe profile
 */
exports.getMe = async (req, res, next) => {
  try {
    // set by auth middleware
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const safeUser = {
      id: user._id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role || 'user',
    };

    return res.status(200).json({ user: safeUser });
  } catch (err) {
    return next(err);
  }
};
