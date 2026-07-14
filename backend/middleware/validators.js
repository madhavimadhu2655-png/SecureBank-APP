const { body } = require('express-validator');

const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2–50 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Name contains invalid characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must include uppercase, lowercase, number, and special character'),
];

const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const transferValidation = [
  body('receiverAccountNumber')
    .trim()
    .notEmpty().withMessage('Receiver account number is required')
    .matches(/^BNK\d{10}$/).withMessage('Invalid account number format'),

  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01, max: 1000000 }).withMessage('Amount must be between 0.01 and 1,000,000')
    .custom((val) => {
      // Ensure exactly 2 decimal places max
      if (!/^\d+(\.\d{1,2})?$/.test(String(val))) {
        throw new Error('Amount can have at most 2 decimal places');
      }
      return true;
    }),

  body('note')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Note cannot exceed 200 characters')
    .escape(), // XSS protection: convert HTML characters
];

module.exports = { registerValidation, loginValidation, transferValidation };
