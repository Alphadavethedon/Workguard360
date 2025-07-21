
// middleware/auth.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Session expired. Please login again.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // or attach user info if decoded token has it
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired. Please login again.' });
  }
};

module.exports = verifyToken;
