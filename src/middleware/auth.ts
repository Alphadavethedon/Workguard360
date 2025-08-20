import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { env } from '../config/env';
import { logger } from '../config/logger';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
      return;
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as any;
      const user = await User.findById(decoded.id).populate('role');
      
      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          message: 'Invalid token or user not active.',
        });
        return;
      }

      req.user = user;
      next();
    } catch (jwtError) {
      logger.warn('JWT verification failed:', jwtError);
      res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
};