/**
 * Loans Routes
 * 
 * Routes for borrowing and returning books.
 */

const express = require('express');
const router = express.Router();
const loansController = require('../controllers/loansController');
const { authenticate, requireRole } = require('../middleware/auth');
const { validateBorrow, validateId } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   POST /api/loans
 * @desc    Borrow a book
 * @access  Private (Member)
 */
router.post('/', authenticate, validateBorrow, asyncHandler(loansController.borrowBook));

/**
 * @route   POST /api/loans/:id/return
 * @desc    Return a book
 * @access  Private (Member, Librarian, Admin)
 */
router.post('/:id/return', authenticate, validateId, asyncHandler(loansController.returnBook));

/**
 * @route   GET /api/loans/my-loans
 * @desc    Get current user's loans
 * @access  Private (Member)
 */
router.get('/my-loans', authenticate, asyncHandler(loansController.getMyLoans));

/**
 * @route   GET /api/loans
 * @desc    Get all loans
 * @access  Private (Librarian, Admin)
 */
router.get('/', authenticate, requireRole('librarian', 'admin'), asyncHandler(loansController.getAllLoans));

/**
 * @route   GET /api/loans/:id
 * @desc    Get loan by ID
 * @access  Private
 */
router.get('/:id', authenticate, validateId, asyncHandler(loansController.getLoanById));

module.exports = router;
