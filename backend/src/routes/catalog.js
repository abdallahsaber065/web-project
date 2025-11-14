/**
 * Catalog Routes (Authors & Categories)
 * 
 * Routes for managing authors and categories.
 */

const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');
const { authenticate, requireRole } = require('../middleware/auth');
const { validateId, handleValidationErrors } = require('../middleware/validation');
const { body } = require('express-validator');
const { asyncHandler } = require('../middleware/errorHandler');

// ==================== AUTHORS ROUTES ====================

/**
 * @route   GET /api/authors
 * @desc    Get all authors
 * @access  Public
 */
router.get('/authors', asyncHandler(catalogController.getAuthors));

/**
 * @route   GET /api/authors/:id
 * @desc    Get author by ID
 * @access  Public
 */
router.get('/authors/:id', validateId, asyncHandler(catalogController.getAuthorById));

/**
 * @route   POST /api/authors
 * @desc    Create new author
 * @access  Private (Librarian, Admin)
 */
router.post(
    '/authors',
    authenticate,
    requireRole('librarian', 'admin'),
    [
        body('name').trim().notEmpty().withMessage('Author name is required'),
        body('biography').optional().trim(),
        handleValidationErrors
    ],
    asyncHandler(catalogController.createAuthor)
);

/**
 * @route   PUT /api/authors/:id
 * @desc    Update author
 * @access  Private (Librarian, Admin)
 */
router.put(
    '/authors/:id',
    authenticate,
    requireRole('librarian', 'admin'),
    validateId,
    asyncHandler(catalogController.updateAuthor)
);

/**
 * @route   DELETE /api/authors/:id
 * @desc    Delete author
 * @access  Private (Admin)
 */
router.delete(
    '/authors/:id',
    authenticate,
    requireRole('admin'),
    validateId,
    asyncHandler(catalogController.deleteAuthor)
);

// ==================== CATEGORIES ROUTES ====================

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/categories', asyncHandler(catalogController.getCategories));

/**
 * @route   GET /api/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get('/categories/:id', validateId, asyncHandler(catalogController.getCategoryById));

/**
 * @route   POST /api/categories
 * @desc    Create new category
 * @access  Private (Librarian, Admin)
 */
router.post(
    '/categories',
    authenticate,
    requireRole('librarian', 'admin'),
    [
        body('name').trim().notEmpty().withMessage('Category name is required'),
        body('description').optional().trim(),
        handleValidationErrors
    ],
    asyncHandler(catalogController.createCategory)
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Private (Librarian, Admin)
 */
router.put(
    '/categories/:id',
    authenticate,
    requireRole('librarian', 'admin'),
    validateId,
    asyncHandler(catalogController.updateCategory)
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category
 * @access  Private (Admin)
 */
router.delete(
    '/categories/:id',
    authenticate,
    requireRole('admin'),
    validateId,
    asyncHandler(catalogController.deleteCategory)
);

module.exports = router;
