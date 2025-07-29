const logger = require('../utils/logger');

const notFound = (req, res, next) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: {
      auth: '/api/auth',
      users: '/api/users',
      incidents: '/api/incidents',
      safety: '/api/safety',
      emergency: '/api/emergency',
      training: '/api/training',
      documents: '/api/documents',
      analytics: '/api/analytics',
      notifications: '/api/notifications'
    }
  });
};

module.exports = notFound;