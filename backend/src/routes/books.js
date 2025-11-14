/**
 * Books Routes
 * 
 * Routes for book catalog management.
 */

const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController');
const { authenticate, requireRole } = require('../middleware/auth');
const { validateBook, validateId, validatePagination, validateSearch } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   GET /api/books
 * @desc    Get all books with pagination and filters
 * @access  Public
 */
router.get('/', validatePagination, validateSearch, asyncHandler(booksController.getBooks));

/**
 * @route   GET /api/books/:id
 * @desc    Get book by ID
 * @access  Public
 */
router.get('/:id', validateId, asyncHandler(booksController.getBookById));

/**
 * @route   POST /api/books
 * @desc    Create a new book
 * @access  Private (Librarian, Admin)
 */
router.post(
    '/',
    authenticate,
    requireRole('librarian', 'admin'),
    validateBook,
    asyncHandler(booksController.createBook)
);

/**
 * @route   PUT /api/books/:id
 * @desc    Update a book
 * @access  Private (Librarian, Admin)
 */
router.put(
    '/:id',
    authenticate,
    requireRole('librarian', 'admin'),
    validateId,
    asyncHandler(booksController.updateBook)
);

/**
 * @route   DELETE /api/books/:id
 * @desc    Delete a book
 * @access  Private (Admin)
 */
router.delete(
    '/:id',
    authenticate,
    requireRole('admin'),
    validateId,
    asyncHandler(booksController.deleteBook)
);

module.exports = router;
