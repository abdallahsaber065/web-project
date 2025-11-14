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

    body('author_ids')
        .isArray({ min: 1 }).withMessage('At least one author is required'),

    body('category_ids')
        .optional()
        .isArray().withMessage('Categories must be an array'),

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
