const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Mock notification storage (in production, use database)
let notifications = [];

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, (req, res) => {
  try {
    const userNotifications = notifications.filter(
      notification => 
        notification.userId === req.user.id ||
        notification.broadcast === true ||
        (notification.roles && notification.roles.includes(req.user.role)) ||
        (notification.departments && notification.departments.includes(req.user.department))
    );

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const total = userNotifications.length;
    const paginatedNotifications = userNotifications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(startIndex, startIndex + limit);

    res.status(200).json({
      success: true,
      count: paginatedNotifications.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      data: paginatedNotifications
    });

  } catch (error) {
    logger.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications'
    });
  }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, (req, res) => {
  try {
    const notification = notifications.find(n => n.id === req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user has access to this notification
    const hasAccess = notification.userId === req.user.id ||
                     notification.broadcast === true ||
                     (notification.roles && notification.roles.includes(req.user.role)) ||
                     (notification.departments && notification.departments.includes(req.user.department));

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this notification'
      });
    }

    // Mark as read for this user
    if (!notification.readBy) {
      notification.readBy = [];
    }

    if (!notification.readBy.includes(req.user.id)) {
      notification.readBy.push(req.user.id);
      notification.readAt = new Date();
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    logger.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read'
    });
  }
});

// @desc    Create notification
// @route   POST /api/notifications
// @access  Private (Manager, Safety Officer, Admin)
router.post('/', protect, authorize('manager', 'safety_officer', 'admin'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('type').isIn(['info', 'warning', 'error', 'success']).withMessage('Invalid notification type'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority level')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const notification = {
      id: Date.now().toString(),
      title: req.body.title,
      message: req.body.message,
      type: req.body.type,
      priority: req.body.priority,
      createdBy: req.user.id,
      createdAt: new Date(),
      broadcast: req.body.broadcast || false,
      userId: req.body.userId || null,
      roles: req.body.roles || [],
      departments: req.body.departments || [],
      actionUrl: req.body.actionUrl || null,
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null,
      isRead: false,
      readBy: []
    };

    notifications.push(notification);

    // Send real-time notification
    const io = req.app.get('io');
    
    if (notification.broadcast) {
      io.emit('notification', notification);
    } else if (notification.userId) {
      io.to(`user-${notification.userId}`).emit('notification', notification);
    } else {
      // Send to specific roles/departments
      if (notification.roles.length > 0) {
        notification.roles.forEach(role => {
          io.to(`role-${role}`).emit('notification', notification);
        });
      }
      if (notification.departments.length > 0) {
        notification.departments.forEach(dept => {
          io.to(`department-${dept}`).emit('notification', notification);
        });
      }
    }

    logger.info(`Notification created by ${req.user.email}: ${notification.title}`);

    res.status(201).json({
      success: true,
      data: notification
    });

  } catch (error) {
    logger.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating notification'
    });
  }
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread/count
// @access  Private
router.get('/unread/count', protect, (req, res) => {
  try {
    const userNotifications = notifications.filter(
      notification => 
        (notification.userId === req.user.id ||
         notification.broadcast === true ||
         (notification.roles && notification.roles.includes(req.user.role)) ||
         (notification.departments && notification.departments.includes(req.user.department))) &&
        (!notification.readBy || !notification.readBy.includes(req.user.id)) &&
        (!notification.expiresAt || new Date(notification.expiresAt) > new Date())
    );

    res.status(200).json({
      success: true,
      count: userNotifications.length
    });

  } catch (error) {
    logger.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread notification count'
    });
  }
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private (Admin only or notification creator)
router.delete('/:id', protect, (req, res) => {
  try {
    const notificationIndex = notifications.findIndex(n => n.id === req.params.id);

    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    const notification = notifications[notificationIndex];

    // Check permissions
    const canDelete = req.user.role === 'admin' || notification.createdBy === req.user.id;

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notification'
      });
    }

    notifications.splice(notificationIndex, 1);

    logger.info(`Notification deleted by ${req.user.email}: ${notification.title}`);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    logger.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification'
    });
  }
});

module.exports = router;