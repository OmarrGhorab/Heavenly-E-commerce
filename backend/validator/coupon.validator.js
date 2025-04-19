import { body, validationResult } from 'express-validator';

export const validateCouponValidator = [
    body('code')
        .optional() // Makes the field optional
        .isString().withMessage('Coupon code must be a string') // Validates only if `code` exists
        .trim()
        .isLength({ min: 3, max: 20 }).withMessage('Coupon code must be between 3 and 20 characters'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next(); // Proceed to the controller if no validation errors
    },
];
