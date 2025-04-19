// routes/auth.route.js
import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { 
  authController,
  profileController,
  orderController 
} from '../controllers/auth.controller.js';
import {
  validateEmailVerification,
  validateForgotPassword,
  validateLogin,
  validateResetPassword,
  validateSignup
} from '../validator/auth.validator.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Authentication Routes
router.post('/signup', authLimiter,  validateSignup, authController.signup);
router.post('/login', authLimiter,  validateLogin, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/reset-password/:token', validateResetPassword, authController.resetPassword);
router.get('/verify-email/:token', validateEmailVerification, authController.verifyEmail);

// Profile Routes
router.route('/profile')
  .get(protectRoute, profileController.getProfile)
  .patch(protectRoute, profileController.updateProfile);

// Order Routes
router.get('/profile/orders', protectRoute, orderController.getUserOrders);

export default router;