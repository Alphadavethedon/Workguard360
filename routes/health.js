const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// @desc    Health check endpoint
// @route   GET /api/health
// @access  Public
router.get('/', async (req, res) => {
  try {
    const healthCheck = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: {
          status: 'Unknown',
          responseTime: null
        },
        memory: {
          used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
          total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
          unit: 'MB'
        },
        cpu: {
          usage: process.cpuUsage()
        }
      }
    };

    // Check database connection
    const dbStart = Date.now();
    try {
      await mongoose.connection.db.admin().ping();
      healthCheck.services.database.status = 'Connected';
      healthCheck.services.database.responseTime = Date.now() - dbStart;
    } catch (dbError) {
      healthCheck.services.database.status = 'Disconnected';
      healthCheck.services.database.error = dbError.message;
      healthCheck.status = 'Warning';
    }

    const statusCode = healthCheck.status === 'OK' ? 200 : 503;
    res.status(statusCode).json(healthCheck);
  } catch (error) {
    res.status(503).json({
      status: 'Error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// @desc    Detailed health check
// @route   GET /api/health/detailed
// @access  Public
router.get('/detailed', async (req, res) => {
  try {
    const User = require('../models/User');
    const Alert = require('../models/Alert');

    const healthCheck = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          status: 'Unknown',
          collections: {}
        },
        api: {
          status: 'OK',
          endpoints: [
            '/api/auth',
            '/api/users',
            '/api/alerts',
            '/api/reports',
            '/api/dashboard'
          ]
        }
      },
      system: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version
      }
    };

    // Test database collections
    try {
      const [userCount, alertCount] = await Promise.all([
        User.countDocuments(),
        Alert.countDocuments()
      ]);

      healthCheck.services.database.status = 'Connected';
      healthCheck.services.database.collections = {
        users: userCount,
        alerts: alertCount
      };
    } catch (dbError) {
      healthCheck.services.database.status = 'Error';
      healthCheck.services.database.error = dbError.message;
      healthCheck.status = 'Warning';
    }

    const statusCode = healthCheck.status === 'OK' ? 200 : 503;
    res.status(statusCode).json(healthCheck);
  } catch (error) {
    res.status(503).json({
      status: 'Error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

module.exports = router;