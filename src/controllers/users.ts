import { Request, Response } from 'express';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { logger } from '../config/logger';
import { generatePagination } from '../utils/pagination';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const department = req.query.department as string;

    const query: any = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { badgeNumber: { $regex: search, $options: 'i' } },
      ];
    }

    if (department && department !== 'all') {
      query.department = department;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate('role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const pagination = generatePagination(total, page, limit);

    res.json({
      success: true,
      data: {
        users,
        pagination,
      },
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).populate('role');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
    });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      role: roleName,
      department,
      jobTitle,
      phone,
      emergencyContact,
      badgeNumber,
      accessLevel,
    } = req.body;

    // Find role by name
    const role = await Role.findOne({ name: { $regex: new RegExp(roleName, 'i') } });
    if (!role) {
      res.status(400).json({
        success: false,
        message: 'Invalid role specified',
      });
      return;
    }

    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: role._id,
      department,
      jobTitle,
      phone,
      emergencyContact,
      badgeNumber,
      accessLevel,
    });

    await user.save();
    await user.populate('role');

    logger.info(`User created: ${user.email}`);

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully',
    });
  } catch (error: any) {
    logger.error('Create user error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create user',
    });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role: roleName, ...updateData } = req.body;

    // If role is being updated, find the role
    if (roleName) {
      const role = await Role.findOne({ name: { $regex: new RegExp(roleName, 'i') } });
      if (!role) {
        res.status(400).json({
          success: false,
          message: 'Invalid role specified',
        });
        return;
      }
      updateData.role = role._id;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('role');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    logger.info(`User updated: ${user.email}`);

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully',
    });
  } catch (error: any) {
    logger.error('Update user error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update user',
    });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    logger.info(`User deactivated: ${user.email}`);

    res.json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
};