'use strict';

const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  logger.error(err.stack || err.message || err);

  const status = err.status || 500;
  const message = status === 500 ? 'Server error' : err.message;

  res.status(status).json({
    success: false,
    message,
  });
};
