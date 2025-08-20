import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { logger } from '../config/logger';

export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
      memory: process.memoryUsage(),
      version: process.version,
    };

    res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({
      success: false,
      message: 'Service unhealthy',
    });
  }
};

export const readinessCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if database is ready
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({
        success: false,
        message: 'Database not ready',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Service ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Readiness check error:', error);
    res.status(503).json({
      success: false,
      message: 'Service not ready',
    });
  }
};

export const versionCheck = (req: Request, res: Response): void => {
  const packageJson = require('../../package.json');
  
  res.json({
    success: true,
    data: {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
      node: process.version,
      environment: process.env.NODE_ENV,
    },
  });
};