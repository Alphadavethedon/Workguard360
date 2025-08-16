'use strict';

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const hdr = req.headers.authorization || '';
    const parts = hdr.split(' ');
    const token = parts.length === 2 && /^Bearer$/i.test(parts[0]) ? parts[1] : null;
    if (!token) return res.status(401).json({ message: 'No token provided' });

    if (!process.env.JWT_SECRET) return res.status(500).json({ message: 'JWT_SECRET not configured' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) return res.status(401).json({ message: 'Invalid token' });

    req.userId = decoded.id;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};
