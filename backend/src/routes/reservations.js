/**
 * Reservations Routes
 * 
 * Routes for book reservations.
 */

const express = require('express');
const router = express.Router();
const reservationsController = require('../controllers/reservationsController');
const { authenticate, requireRole } = require('../middleware/auth');
const { validateReservation, validateId } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   POST /api/reservations
 * @desc    Create a reservation
 * @access  Private (Member)
 */
router.post('/', authenticate, validateReservation, asyncHandler(reservationsController.createReservation));

/**
 * @route   GET /api/reservations/my-reservations
 * @desc    Get current user's reservations
 * @access  Private (Member)
 */
router.get('/my-reservations', authenticate, asyncHandler(reservationsController.getMyReservations));

/**
 * @route   GET /api/reservations
 * @desc    Get all reservations
 * @access  Private (Librarian, Admin)
 */
router.get('/', authenticate, requireRole('librarian', 'admin'), asyncHandler(reservationsController.getAllReservations));

/**
 * @route   DELETE /api/reservations/:id
 * @desc    Cancel a reservation
 * @access  Private
 */
router.delete('/:id', authenticate, validateId, asyncHandler(reservationsController.cancelReservation));

module.exports = router;
