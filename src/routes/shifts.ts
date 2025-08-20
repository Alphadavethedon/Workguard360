import { Router } from 'express';
import {
  getShifts,
  createShift,
  updateShift,
  deleteShift,
  getShiftById,
} from '../controllers/shifts';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const createShiftSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    days: z.array(z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])).min(1),
    roles: z.array(z.enum(['admin', 'hr', 'security', 'employee'])).min(1),
  }),
});

const updateShiftSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    days: z.array(z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])).min(1).optional(),
    roles: z.array(z.enum(['admin', 'hr', 'security', 'employee'])).min(1).optional(),
    isActive: z.boolean().optional(),
  }),
});

// All shift routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /shifts:
 *   get:
 *     summary: Get all shifts
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of shifts
 */
router.get('/', getShifts);

/**
 * @swagger
 * /shifts/{id}:
 *   get:
 *     summary: Get shift by ID
 *     tags: [Shifts]
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
 *         description: Shift data
 *       404:
 *         description: Shift not found
 */
router.get('/:id', getShiftById);

// HR and Admin can manage shifts
router.use(requireRole('hr', 'admin'));

/**
 * @swagger
 * /shifts:
 *   post:
 *     summary: Create new shift
 *     tags: [Shifts]
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
 *               startTime:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *               endTime:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *               days:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [admin, hr, security, employee]
 *     responses:
 *       201:
 *         description: Shift created successfully
 */
router.post('/', validate(createShiftSchema), createShift);

/**
 * @swagger
 * /shifts/{id}:
 *   put:
 *     summary: Update shift
 *     tags: [Shifts]
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
 *         description: Shift updated successfully
 */
router.put('/:id', validate(updateShiftSchema), updateShift);

/**
 * @swagger
 * /shifts/{id}:
 *   delete:
 *     summary: Delete shift
 *     tags: [Shifts]
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
 *         description: Shift deleted successfully
 */
router.delete('/:id', deleteShift);

export default router;