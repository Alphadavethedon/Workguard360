// controllers/authController.js  (example)
const User = require('../models/User'); // adjust to your actual model import
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });

    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    // if stored password hash exists:
    const match = await bcrypt.compare(password, user.password || '');
    if (!match) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });
    const refreshToken = ''; // generate if you support refresh tokens

    // return canonical payload
    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        // include other safe user fields as needed (avoid sensitive data)
      },
      token,
      refreshToken,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
