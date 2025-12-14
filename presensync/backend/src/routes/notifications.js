import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as notificationController from '../controllers/notificationController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get user notifications
router.get('/', notificationController.getNotifications);

// Mark notification as read
router.put('/:id/read', notificationController.markAsRead);

// Mark all as read
router.put('/read-all', notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

export default router;

