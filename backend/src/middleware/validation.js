import { body, validationResult } from 'express-validator';
import { sanitize } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

// Sanitize input data
export const sanitizeInput = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }
  
  next();
};

// User registration validation
export const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('age')
    .optional()
    .isInt({ min: 18, max: 120 })
    .withMessage('Age must be between 18 and 120'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer-not-to-say'])
    .withMessage('Invalid gender selection'),
  
  body('address.street')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),
  
  body('address.city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  
  body('address.zipCode')
    .trim()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Please provide a valid ZIP code'),
  
  body('address.state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  
  handleValidationErrors
];

// User login validation
export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Case creation validation
export const validateCaseCreation = [
  body('caseType')
    .isIn(['Family', 'Business', 'Criminal', 'Property', 'Employment', 'Other'])
    .withMessage('Invalid case type'),
  
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('oppositePartyName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Opposite party name must be between 2 and 100 characters'),
  
  body('oppositePartyEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address for opposite party'),
  
  body('oppositePartyPhone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number for opposite party'),
  
  body('isPendingInCourt')
    .isBoolean()
    .withMessage('isPendingInCourt must be a boolean value'),
  
  body('firNumber')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('FIR number must be between 3 and 50 characters'),
  
  body('courtName')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Court name must be between 3 and 100 characters'),
  
  body('policeStation')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Police station name must be between 3 and 100 characters'),
  
  handleValidationErrors
];

// Case update validation
export const validateCaseUpdate = [
  body('status')
    .optional()
    .isIn([
      'Pending Verification',
      'Verified',
      'Awaiting Response',
      'Accepted',
      'Rejected',
      'Panel Created',
      'Mediation in Progress',
      'Resolved',
      'Unresolved'
    ])
    .withMessage('Invalid status'),
  
  body('resolutionDetails')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Resolution details must be between 10 and 1000 characters'),
  
  handleValidationErrors
];

// Witness validation
export const validateWitness = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Witness name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address for witness'),
  
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number for witness'),
  
  body('relationship')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Relationship must be between 2 and 100 characters'),
  
  handleValidationErrors
];

// Panel member validation
export const validatePanelMember = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Panel member name must be between 2 and 100 characters'),
  
  body('role')
    .isIn(['Lawyer', 'Religious Leader', 'Community Representative'])
    .withMessage('Invalid panel member role'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address for panel member'),
  
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number for panel member'),
  
  handleValidationErrors
];

// File upload validation
export const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'audio/mpeg',
    'application/pdf'
  ];

  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10485760; // 10MB

  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'File type not allowed'
    });
  }

  if (req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: 'File size too large'
    });
  }

  next();
}; 