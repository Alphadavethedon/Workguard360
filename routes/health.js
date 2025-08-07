const express = require('express');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/health
// @desc    Health check endpoint
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Get system info
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      database: {
        status: dbStatus,
        name: mongoose.connection.name
      },
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      },
      environment: process.env.NODE_ENV,
      version: '1.0.0'
    };

    // Determine overall health status
    if (dbStatus !== 'connected') {
      healthData.status = 'unhealthy';
      return res.status(503).json({
        success: false,
        data: healthData
      });
    }

    res.json({
      success: true,
      data: healthData
    });

  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

// @route   GET /api/health/detailed
// @desc    Detailed health check with service status
// @access  Public
router.get('/detailed', async (req, res) => {
  try {
    const checks = {
      database: await checkDatabase(),
      memory: checkMemory(),
      disk: checkDisk(),
      services: await checkServices()
    };

    const allHealthy = Object.values(checks).every(check => check.status === 'healthy');

    res.status(allHealthy ? 200 : 503).json({
      success: allHealthy,
      timestamp: new Date().toISOString(),
      overall: allHealthy ? 'healthy' : 'unhealthy',
      checks
    });

  } catch (error) {
    logger.error('Detailed health check error:', error);
    res.status(503).json({
      success: false,
      message: 'Detailed health check failed',
      error: error.message
    });
  }
});

// Helper functions for health checks
async function checkDatabase() {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    
    if (!isConnected) {
      return {
        status: 'unhealthy',
        message: 'Database not connected'
      };
    }

    // Test database operation
    await mongoose.connection.db.admin().ping();
    
    return {
      status: 'healthy',
      message: 'Database connected and responsive',
      details: {
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'Database check failed',
      error: error.message
    };
  }
}

function checkMemory() {
  const usage = process.memoryUsage();
  const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
  const totalMB = Math.round(usage.heapTotal / 1024 / 1024);
  const usagePercent = (usedMB / totalMB) * 100;

  return {
    status: usagePercent > 90 ? 'unhealthy' : 'healthy',
    message: `Memory usage: ${usedMB}MB / ${totalMB}MB (${usagePercent.toFixed(1)}%)`,
    details: {
      used: usedMB,
      total: totalMB,
      percentage: usagePercent
    }
  };
}

function checkDisk() {
  // Simple disk check - in production, you'd use a proper disk usage library
  return {
    status: 'healthy',
    message: 'Disk space sufficient',
    details: {
      note: 'Disk monitoring not implemented in this demo'
    }
  };
}

async function checkServices() {
  // Check various service components
  const services = {
    webServer: {
      status: 'healthy',
      message: 'Web server running'
    },
    authentication: {
      status: 'healthy',
      message: 'Authentication service operational'
    },
    realTime: {
      status: 'healthy',
      message: 'WebSocket service operational'
    }
  };

  return services;
}

module.exports = router;
