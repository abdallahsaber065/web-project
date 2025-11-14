/**
 * Validation Middleware
 * 
 * Common validation functions for request data.
 * Uses express-validator for robust validation.
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Handle validation errors
 * Returns formatted error messages if validation fails
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }

    next();
};

/**
 * User registration validation rules
 */
const validateRegistration = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 128 }).withMessage('Name must be 2-128 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

    handleValidationErrors
];

/**
 * User login validation rules
 */
const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required'),

    handleValidationErrors
];

/**
 * Book creation validation rules
 */
const validateBook = [
    body('isbn')
        .optional()
        .trim()
        .isLength({ min: 10, max: 13 }).withMessage('ISBN must be 10-13 characters'),

    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ max: 255 }).withMessage('Title too long'),

    body('description')
        .optional()
        .trim(),

    body('publisher')
        .optional()
        .trim()
        .isLength({ max: 255 }).withMessage('Publisher name too long'),

    body('publication_year')
        .optional()
        .isInt({ min: 1000, max: new Date().getFullYear() + 1 })
        .withMessage('Invalid publication year'),

    body('total_copies')
        .isInt({ min: 1 }).withMessage('Total copies must be at least 1'),

    // Accept either author_ids (array of IDs) or author_names (comma-separated string)
    body('author_ids')
        .optional()
        .isArray({ min: 1 }).withMessage('At least one author is required'),

    body('author_names')
        .optional()
        .custom(value => {
            if (Array.isArray(value)) {
                return value.every(v => (typeof v === 'string' && v.trim().length > 0));
            }
            if (typeof value === 'string') {
                return value.trim().length > 0;
            }
            return false;
        }).withMessage('Author names must be a string or an array of strings'),

    // Accept either category_ids (array of IDs) or category_names (comma-separated string)
    body('category_ids')
        .optional()
        .isArray().withMessage('Categories must be an array'),

    body('category_names')
        .optional()
        .custom(value => {
            if (Array.isArray(value)) {
                return value.every(v => (typeof v === 'string' && v.trim().length > 0));
            }
            if (typeof value === 'string') {
                return value.trim().length > 0;
            }
            return false;
        }).withMessage('Category names must be a string or an array of strings'),

    // Custom validation: at least one of author_ids or author_names must be provided
    body().custom((value, { req }) => {
        const hasAuthorIds = (Array.isArray(req.body.author_ids) && req.body.author_ids.length > 0) || (typeof req.body.author_ids === 'string' && req.body.author_ids.trim() !== '');
        const hasAuthorNames = (Array.isArray(req.body.author_names) && req.body.author_names.length > 0) || (typeof req.body.author_names === 'string' && req.body.author_names.trim() !== '');
        if (!hasAuthorIds && !hasAuthorNames) {
            throw new Error('At least one author is required');
        }
        return true;
    }),

    handleValidationErrors
];

/**
 * ID parameter validation
 */
const validateId = [
    param('id')
        .isInt({ min: 1 }).withMessage('Invalid ID'),

    handleValidationErrors
];

/**
 * Pagination validation
 */
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

    handleValidationErrors
];

/**
 * Search query validation
 */
const validateSearch = [
    query('search')
        .optional()
        .trim()
        .isLength({ max: 255 }).withMessage('Search query too long'),

    query('author')
        .optional()
        .trim(),

    query('category')
        .optional()
        .trim(),

    handleValidationErrors
];

/**
 * Borrow validation
 */
const validateBorrow = [
    body('book_id')
        .isInt({ min: 1 }).withMessage('Valid book ID is required'),

    handleValidationErrors
];

/**
 * Reservation validation
 */
const validateReservation = [
    body('book_id')
        .isInt({ min: 1 }).withMessage('Valid book ID is required'),

    handleValidationErrors
];

module.exports = {
    validateRegistration,
    validateLogin,
    validateBook,
    validateId,
    validatePagination,
    validateSearch,
    validateBorrow,
    validateReservation,
    handleValidationErrors
};
