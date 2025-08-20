import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import alertRoutes from './alerts';
import reportRoutes from './reports';
import shiftRoutes from './shifts';
import floorRoutes from './floors';
import dashboardRoutes from './dashboard';
import healthRoutes from './health';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/alerts', alertRoutes);
router.use('/reports', reportRoutes);
router.use('/shifts', shiftRoutes);
router.use('/floors', floorRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/', healthRoutes);

export default router;