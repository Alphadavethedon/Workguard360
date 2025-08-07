const logger = require('../utils/logger');

const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. User not authenticated.'
        });
      }

      // Check if user has any of the required roles
      const hasRole = roles.some(role => {
        if (req.user.role === role) return true;
        if (req.user.permissions && req.user.permissions.includes(role)) return true;
        return false;
      });

      if (!hasRole) {
        logger.warn(`Access denied for user ${req.user._id}. Required roles: ${roles.join(', ')}, User role: ${req.user.role}`);
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.'
        });
      }

      next();
    } catch (error) {
      logger.error('Authorization middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during authorization'
      });
    }
  };
};

module.exports = authorize;