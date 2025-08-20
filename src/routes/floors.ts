import { Router } from 'express';
import {
  getFloors,
  createFloor,
  updateFloor,
  deleteFloor,
  getFloorById,
} from '../controllers/floors';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const createFloorSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    level: z.number().min(0),
    description: z.string().min(5),
    accessRoles: z.array(z.enum(['admin', 'hr', 'security', 'employee'])).min(1),
  }),
});

const updateFloorSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    level: z.number().min(0).optional(),
    description: z.string().min(5).optional(),
    accessRoles: z.array(z.enum(['admin', 'hr', 'security', 'employee'])).min(1).optional(),
    isActive: z.boolean().optional(),
  }),
});

// All floor routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /floors:
 *   get:
 *     summary: Get all floors
 *     tags: [Floors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of floors
 */
router.get('/', getFloors);

/**
 * @swagger
 * /floors/{id}:
 *   get:
 *     summary: Get floor by ID
 *     tags: [Floors]
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
 *         description: Floor data
 *       404:
 *         description: Floor not found
 */
router.get('/:id', getFloorById);

// Only admin can manage floors
router.use(requireRole('admin'));

/**
 * @swagger
 * /floors:
 *   post:
 *     summary: Create new floor
 *     tags: [Floors]
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
 *               level:
 *                 type: integer
 *                 minimum: 0
 *               description:
 *                 type: string
 *               accessRoles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [admin, hr, security, employee]
 *     responses:
 *       201:
 *         description: Floor created successfully
 */
router.post('/', validate(createFloorSchema), createFloor);

/**
 * @swagger
 * /floors/{id}:
 *   put:
 *     summary: Update floor
 *     tags: [Floors]
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
 *         description: Floor updated successfully
 */
router.put('/:id', validate(updateFloorSchema), updateFloor);

/**
 * @swagger
 * /floors/{id}:
 *   delete:
 *     summary: Delete floor
 *     tags: [Floors]
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
 *         description: Floor deleted successfully
 */
router.delete('/:id', deleteFloor);

export default router;