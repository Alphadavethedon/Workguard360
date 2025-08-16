'use strict';

const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  try {
    const hdr = req.headers.authorization || '';
    // Expected: "Bearer <token>"
    const parts = hdr.split(' ');
    const token = parts.length === 2 && /^Bearer$/i.test(parts[0]) ? parts[1] : null;

    if (!token) return res.status(401).json({ message: 'No token provided' });

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET missing');

    const decoded = jwt.verify(token, secret);
    if (!decoded?.id) return res.status(401).json({ message: 'Invalid token' });

    req.userId = decoded.id; // used by controllers
    return next();
  } catch (err) {
    // TokenExpiredError, JsonWebTokenError, etc.
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};
