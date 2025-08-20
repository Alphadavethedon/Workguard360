import { Request, Response } from 'express';
import { Alert } from '../models/Alert';
import { logger } from '../config/logger';
import { generatePagination } from '../utils/pagination';
import { AuthRequest } from '../middleware/auth';
import { io } from '../server';

export const getAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const severity = req.query.severity as string;
    const type = req.query.type as string;
    const search = req.query.search as string;

    const query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (severity) {
      query.severity = severity;
    }

    if (type) {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Alert.countDocuments(query);
    const alerts = await Alert.find(query)
      .populate('assignedTo acknowledgedBy resolvedBy')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const pagination = generatePagination(total, page, limit);

    res.json({
      success: true,
      data: {
        alerts,
        pagination,
      },
    });
  } catch (error) {
    logger.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
    });
  }
};

export const getAlertById = async (req: Request, res: Response): Promise<void> => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('assignedTo acknowledgedBy resolvedBy');

    if (!alert) {
      res.status(404).json({
        success: false,
        message: 'Alert not found',
      });
      return;
    }

    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    logger.error('Get alert by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alert',
    });
  }
};

export const acknowledgeAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        status: 'acknowledged',
        acknowledgedBy: req.user._id,
        acknowledgedAt: new Date(),
      },
      { new: true }
    ).populate('assignedTo acknowledgedBy resolvedBy');

    if (!alert) {
      res.status(404).json({
        success: false,
        message: 'Alert not found',
      });
      return;
    }

    // Emit real-time update
    io.of('/alerts').emit('alertUpdated', alert);

    logger.info(`Alert acknowledged: ${alert._id} by ${req.user.email}`);

    res.json({
      success: true,
      data: alert,
      message: 'Alert acknowledged successfully',
    });
  } catch (error) {
    logger.error('Acknowledge alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to acknowledge alert',
    });
  }
};

export const resolveAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        status: 'resolved',
        resolvedBy: req.user._id,
        resolvedAt: new Date(),
      },
      { new: true }
    ).populate('assignedTo acknowledgedBy resolvedBy');

    if (!alert) {
      res.status(404).json({
        success: false,
        message: 'Alert not found',
      });
      return;
    }

    // Emit real-time update
    io.of('/alerts').emit('alertUpdated', alert);

    logger.info(`Alert resolved: ${alert._id} by ${req.user.email}`);

    res.json({
      success: true,
      data: alert,
      message: 'Alert resolved successfully',
    });
  } catch (error) {
    logger.error('Resolve alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve alert',
    });
  }
};