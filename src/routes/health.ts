import { Router } from 'express';
import { healthCheck, readinessCheck, versionCheck } from '../controllers/health';

const router = Router();

/**
 * @swagger
 * /healthz:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get('/healthz', healthCheck);

/**
 * @swagger
 * /readyz:
 *   get:
 *     summary: Readiness check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
 */
router.get('/readyz', readinessCheck);

/**
 * @swagger
 * /version:
 *   get:
 *     summary: Version information
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Version information
 */
router.get('/version', versionCheck);

export default router;