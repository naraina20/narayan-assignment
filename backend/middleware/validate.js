const { body } = require('express-validator');

// Common email validations
const emailValidation = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email')
];

exports.registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  ...emailValidation,
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

exports.loginValidation = [
  ...emailValidation,
  body('password').notEmpty().withMessage('Password is required')
];

exports.forgotPasswordValidation = [...emailValidation];

exports.resetPasswordValidation = [
  body('password')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword')
    .notEmpty().withMessage('Confirm Password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

exports.updateProfileValidation = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('role').optional().notEmpty().withMessage('Role cannot be empty')
];
