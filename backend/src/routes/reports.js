/**
 * Reports Routes
 * 
 * Routes for statistical reports and analytics.
 */

const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { authenticate, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   GET /api/reports/most-borrowed
 * @desc    Get most borrowed books
 * @access  Private (Librarian, Admin)
 */
router.get(
    '/most-borrowed',
    authenticate,
    requireRole('librarian', 'admin'),
    asyncHandler(reportsController.getMostBorrowed)
);

/**
 * @route   GET /api/reports/overdue
 * @desc    Get overdue loans report
 * @access  Private (Librarian, Admin)
 */
router.get(
    '/overdue',
    authenticate,
    requireRole('librarian', 'admin'),
    asyncHandler(reportsController.getOverdueLoans)
);

/**
 * @route   GET /api/reports/member-activity
 * @desc    Get member activity report
 * @access  Private (Librarian, Admin)
 */
router.get(
    '/member-activity',
    authenticate,
    requireRole('librarian', 'admin'),
    asyncHandler(reportsController.getMemberActivity)
);

/**
 * @route   GET /api/reports/statistics
 * @desc    Get library statistics
 * @access  Private (Librarian, Admin)
 */
router.get(
    '/statistics',
    authenticate,
    requireRole('librarian', 'admin'),
    asyncHandler(reportsController.getStatistics)
);

/**
 * @route   GET /api/reports/loans-by-date
 * @desc    Get loans by date range
 * @access  Private (Librarian, Admin)
 */
router.get(
    '/loans-by-date',
    authenticate,
    requireRole('librarian', 'admin'),
    asyncHandler(reportsController.getLoansByDate)
);

module.exports = router;
