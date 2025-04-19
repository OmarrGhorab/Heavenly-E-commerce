import { body, validationResult, param } from 'express-validator';
import User from '../models/user.model.js';


export const validateSignup = [
  // Email validation
  body('email')
    .matches(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    )
    .notEmpty()
    .withMessage('Enter a valid email address'),

  // Password validation
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .withMessage(
      'Password must include at least one letter, one number, and one special character'
    ),

  // Username validation
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .matches(/^[A-Za-z0-9_ ]+$/)
    .withMessage(
      'Username must not contain special characters other than underscore (_)'
    ),

  // Validation result check and error handling
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next(); // Proceed to the signup controller if no errors
  },
];

export const validateLogin = [
  // Email validation
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Enter a valid email address'),

  // Password validation
  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  // Validation result check and error handling
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next(); // Proceed to the login controller if no errors
  },
];


export const validateForgotPassword = [
  // Email validation
  body('email')
    .isEmail()
    .withMessage('Enter a valid email address')
    .normalizeEmail()
    .custom(async (email) => {
      // Check if the email exists in your database
      const user = await User.findOne({ email });
      if (!user) {
        // You may want to return a generic message for security reasons
        throw new Error('No account found with this email');
      }
      return true;
    }),

  // Validation result check and error handling
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next(); // Proceed to the password reset logic if no errors
  },
];

export const validateResetPassword = [
    // Validate the new password
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .withMessage('Password must contain letters, numbers, and special characters'),
    // Validate token (though this is mainly to ensure it's in the request)
    param('token').exists().withMessage('Reset token is required')
];

export const validateEmailVerification = [
    // Validate the token parameter
    param('token').exists().withMessage('Verification token is required'),
];