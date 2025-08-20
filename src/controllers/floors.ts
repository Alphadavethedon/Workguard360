import { Request, Response } from 'express';
import { Floor } from '../models/Floor';
import { logger } from '../config/logger';
import { generatePagination } from '../utils/pagination';

export const getFloors = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const query: any = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const total = await Floor.countDocuments(query);
    const floors = await Floor.find(query)
      .sort({ level: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const pagination = generatePagination(total, page, limit);

    res.json({
      success: true,
      data: {
        floors,
        pagination,
      },
    });
  } catch (error) {
    logger.error('Get floors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch floors',
    });
  }
};

export const getFloorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const floor = await Floor.findById(req.params.id);

    if (!floor) {
      res.status(404).json({
        success: false,
        message: 'Floor not found',
      });
      return;
    }

    res.json({
      success: true,
      data: floor,
    });
  } catch (error) {
    logger.error('Get floor by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch floor',
    });
  }
};

export const createFloor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, level, description, accessRoles } = req.body;

    const floor = new Floor({
      name,
      level,
      description,
      accessRoles,
    });

    await floor.save();

    logger.info(`Floor created: ${floor.name}`);

    res.status(201).json({
      success: true,
      data: floor,
      message: 'Floor created successfully',
    });
  } catch (error) {
    logger.error('Create floor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create floor',
    });
  }
};

export const updateFloor = async (req: Request, res: Response): Promise<void> => {
  try {
    const floor = await Floor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!floor) {
      res.status(404).json({
        success: false,
        message: 'Floor not found',
      });
      return;
    }

    logger.info(`Floor updated: ${floor.name}`);

    res.json({
      success: true,
      data: floor,
      message: 'Floor updated successfully',
    });
  } catch (error) {
    logger.error('Update floor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update floor',
    });
  }
};

export const deleteFloor = async (req: Request, res: Response): Promise<void> => {
  try {
    const floor = await Floor.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!floor) {
      res.status(404).json({
        success: false,
        message: 'Floor not found',
      });
      return;
    }

    logger.info(`Floor deactivated: ${floor.name}`);

    res.json({
      success: true,
      message: 'Floor deleted successfully',
    });
  } catch (error) {
    logger.error('Delete floor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete floor',
    });
  }
};