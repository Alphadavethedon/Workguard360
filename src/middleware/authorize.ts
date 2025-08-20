import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    const userRole = req.user.role?.name?.toLowerCase();
    const allowedRoles = roles.map(role => role.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions.',
      });
      return;
    }

    next();
  };
};

export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    const userPermissions = req.user.role?.permissions || [];
    const hasPermission = userPermissions.some((p: any) => p.name === permission);

    if (!hasPermission && req.user.role?.name !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions.',
      });
      return;
    }

    next();
  };
};