import express from 'express';
import { createNotification, getUserNotifications, markAllAsRead, markNotificationAsRead } from '../controllers/notification.controller.js'
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protectRoute, getUserNotifications);
router.put('/mark-all-read', protectRoute, markAllAsRead);
router.post('/', protectRoute, createNotification);
router.put('/:id', protectRoute, markNotificationAsRead);
export default router;
