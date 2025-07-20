const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
};

// User validation rules
const validateUser = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('employeeId')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Employee ID must be between 3 and 20 characters'),
  
  body('department')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Department must be between 2 and 50 characters'),
  
  body('role')
    .optional()
    .isIn(['admin', 'hr', 'security', 'employee'])
    .withMessage('Invalid role'),
  
  handleValidationErrors
];

// Login validation rules
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  handleValidationErrors
];

// Password validation rules
const validatePassword = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  handleValidationErrors
];

// Access log validation rules
const validateAccessLog = [
  body('employeeId')
    .trim()
    .notEmpty()
    .withMessage('Employee ID is required'),
  
  body('floor')
    .isMongoId()
    .withMessage('Valid floor ID is required'),
  
  body('accessType')
    .isIn(['entry', 'exit'])
    .withMessage('Access type must be either entry or exit'),
  
  body('accessMethod')
    .optional()
    .isIn(['card', 'biometric', 'pin', 'manual'])
    .withMessage('Invalid access method'),
  
  handleValidationErrors
];

// Alert validation rules
const validateAlert = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Message must be between 10 and 500 characters'),
  
  body('type')
    .isIn(['security', 'violation', 'system', 'maintenance'])
    .withMessage('Invalid alert type'),
  
  body('severity')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid severity level'),
  
  handleValidationErrors
];

// Shift validation rules
const validateShift = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Shift name must be between 2 and 50 characters'),
  
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  
  body('endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  
  body('days')
    .isArray({ min: 1 })
    .withMessage('At least one day must be selected'),
  
  body('days.*')
    .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Invalid day'),
  
  handleValidationErrors
];

// Floor validation rules
const validateFloor = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Floor name must be between 2 and 50 characters'),
  
  body('level')
    .isInt()
    .withMessage('Floor level must be a number'),
  
  body('securityLevel')
    .optional()
    .isIn(['low', 'medium', 'high', 'restricted'])
    .withMessage('Invalid security level'),
  
  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = (field = 'id') => [
  param(field)
    .isMongoId()
    .withMessage(`Invalid ${field}`),
  
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUser,
  validateLogin,
  validatePassword,
  validateAccessLog,
  validateAlert,
  validateShift,
  validateFloor,
  validateObjectId,
  validatePagination
};