const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

// Set your JWT expiry time and secret
const JWT_EXPIRES_IN = '1d';
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret';

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email }).populate('role');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Create JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Save last login timestamp
    user.lastLogin = new Date();
    await user.save();

    // Set token as HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Send user details (exclude password)
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department,
        jobTitle: user.jobTitle,
        phone: user.phone,
        emergencyContact: user.emergencyContact,
        badgeNumber: user.badgeNumber,
        accessLevel: user.accessLevel,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        permissions: user.role.permissions,
      },
      token, // optional: frontend may store token in memory (NOT localStorage)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🧠 /api/auth/me — Validate current user session
const getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).populate('role');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.role.permissions,
    });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(401).json({ message: 'Session expired. Please login again.' });
  }
};

// 🔓 /api/auth/logout — Clear session token
const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'None',
    secure: process.env.NODE_ENV === 'production',
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {
  login,
  getCurrentUser,
  logout,
};
