import { Router } from 'express';
import {
  getReports,
  generateReport,
  downloadReport,
  getReportById,
} from '../controllers/reports';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const generateReportSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    type: z.enum(['access', 'compliance', 'security', 'attendance', 'system', 'custom']),
    description: z.string().min(5),
    dateRange: z.object({
      start: z.string().datetime(),
      end: z.string().datetime(),
    }),
    format: z.enum(['pdf', 'csv', 'excel', 'json']).default('pdf'),
  }),
});

// All report routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Get all reports
 *     tags: [Reports]
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
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [generating, ready, failed, expired]
 *     responses:
 *       200:
 *         description: List of reports
 */
router.get('/', getReports);

/**
 * @swagger
 * /reports/{id}:
 *   get:
 *     summary: Get report by ID
 *     tags: [Reports]
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
 *         description: Report data
 *       404:
 *         description: Report not found
 */
router.get('/:id', getReportById);

/**
 * @swagger
 * /reports/generate:
 *   post:
 *     summary: Generate new report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [access, compliance, security, attendance, system, custom]
 *               description:
 *                 type: string
 *               dateRange:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                     format: date-time
 *                   end:
 *                     type: string
 *                     format: date-time
 *               format:
 *                 type: string
 *                 enum: [pdf, csv, excel, json]
 *                 default: pdf
 *     responses:
 *       201:
 *         description: Report generation started
 */
router.post('/generate', validate(generateReportSchema), generateReport);

/**
 * @swagger
 * /reports/download:
 *   get:
 *     summary: Download report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, csv]
 *           default: pdf
 *     responses:
 *       200:
 *         description: Report file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get('/download', downloadReport);

export default router;