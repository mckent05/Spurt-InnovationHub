// validators/authValidator.js
const { body } = require('express-validator');

const registerValidator = [
  body('username')
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(['admin', 'user'])
    .withMessage('Role must be either admin or user')
];

module.exports = { registerValidator };
