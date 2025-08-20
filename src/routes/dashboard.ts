import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard';
import { authenticate } from '../middleware/auth';

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalEmployees:
 *                       type: integer
 *                     activeEmployees:
 *                       type: integer
 *                     totalAlerts:
 *                       type: integer
 *                     criticalAlerts:
 *                       type: integer
 *                     todayEntries:
 *                       type: integer
 *                     complianceScore:
 *                       type: integer
 *                     systemHealth:
 *                       type: integer
 */
router.get('/stats', getDashboardStats);

export default router;