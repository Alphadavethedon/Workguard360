import { Router } from 'express';
import {
  getAlerts,
  acknowledgeAlert,
  resolveAlert,
  getAlertById,
} from '../controllers/alerts';
import { authenticate } from '../middleware/auth';

const router = Router();

// All alert routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /alerts:
 *   get:
 *     summary: Get all alerts
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, acknowledged, resolved]
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [security, compliance, system, emergency]
 *     responses:
 *       200:
 *         description: List of alerts
 */
router.get('/', getAlerts);

/**
 * @swagger
 * /alerts/{id}:
 *   get:
 *     summary: Get alert by ID
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alert data
 *       404:
 *         description: Alert not found
 */
router.get('/:id', getAlertById);

/**
 * @swagger
 * /alerts/{id}/acknowledge:
 *   put:
 *     summary: Acknowledge alert
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alert acknowledged successfully
 */
router.put('/:id/acknowledge', acknowledgeAlert);

/**
 * @swagger
 * /alerts/{id}/resolve:
 *   put:
 *     summary: Resolve alert
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alert resolved successfully
 */
router.put('/:id/resolve', resolveAlert);

export default router;