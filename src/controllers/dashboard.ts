import { Request, Response } from 'express';
import { User } from '../models/User';
import { Alert } from '../models/Alert';
import { logger } from '../config/logger';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get current date for today's calculations
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Parallel queries for better performance
    const [
      totalEmployees,
      activeEmployees,
      totalAlerts,
      criticalAlerts,
      todayEntries,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Alert.countDocuments(),
      Alert.countDocuments({ severity: 'critical', status: { $ne: 'resolved' } }),
      User.countDocuments({
        lastLogin: { $gte: startOfDay, $lt: endOfDay }
      }),
    ]);

    // Calculate compliance score (simplified calculation)
    const resolvedAlerts = await Alert.countDocuments({ status: 'resolved' });
    const complianceScore = totalAlerts > 0 ? Math.round((resolvedAlerts / totalAlerts) * 100) : 100;

    // System health (simplified - in real app would check various services)
    const systemHealth = 98; // Mock value

    const stats = {
      totalEmployees,
      activeEmployees,
      totalAlerts,
      criticalAlerts,
      todayEntries,
      complianceScore,
      systemHealth,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
    });
  }
};