import { Request, Response } from 'express';
import { Shift } from '../models/Shift';
import { logger } from '../config/logger';
import { generatePagination } from '../utils/pagination';

export const getShifts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const query: any = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const total = await Shift.countDocuments(query);
    const shifts = await Shift.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const pagination = generatePagination(total, page, limit);

    res.json({
      success: true,
      data: {
        shifts,
        pagination,
      },
    });
  } catch (error) {
    logger.error('Get shifts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shifts',
    });
  }
};

export const getShiftById = async (req: Request, res: Response): Promise<void> => {
  try {
    const shift = await Shift.findById(req.params.id);

    if (!shift) {
      res.status(404).json({
        success: false,
        message: 'Shift not found',
      });
      return;
    }

    res.json({
      success: true,
      data: shift,
    });
  } catch (error) {
    logger.error('Get shift by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shift',
    });
  }
};

export const createShift = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, startTime, endTime, days, roles } = req.body;

    const shift = new Shift({
      name,
      startTime,
      endTime,
      days,
      roles,
    });

    await shift.save();

    logger.info(`Shift created: ${shift.name}`);

    res.status(201).json({
      success: true,
      data: shift,
      message: 'Shift created successfully',
    });
  } catch (error) {
    logger.error('Create shift error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create shift',
    });
  }
};

export const updateShift = async (req: Request, res: Response): Promise<void> => {
  try {
    const shift = await Shift.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!shift) {
      res.status(404).json({
        success: false,
        message: 'Shift not found',
      });
      return;
    }

    logger.info(`Shift updated: ${shift.name}`);

    res.json({
      success: true,
      data: shift,
      message: 'Shift updated successfully',
    });
  } catch (error) {
    logger.error('Update shift error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update shift',
    });
  }
};

export const deleteShift = async (req: Request, res: Response): Promise<void> => {
  try {
    const shift = await Shift.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!shift) {
      res.status(404).json({
        success: false,
        message: 'Shift not found',
      });
      return;
    }

    logger.info(`Shift deactivated: ${shift.name}`);

    res.json({
      success: true,
      message: 'Shift deleted successfully',
    });
  } catch (error) {
    logger.error('Delete shift error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete shift',
    });
  }
};