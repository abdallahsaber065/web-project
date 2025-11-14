/**
 * Users Routes
 * 
 * Routes for user management (Admin only).
 */

const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticate, requireRole } = require('../middleware/auth');
const { validateId, handleValidationErrors } = require('../middleware/validation');
const { body } = require('express-validator');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin)
 */
router.get('/', authenticate, requireRole('admin'), asyncHandler(usersController.getAllUsers));

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin)
 */
router.get('/:id', authenticate, requireRole('admin'), validateId, asyncHandler(usersController.getUserById));

/**
 * @route   PUT /api/users/:id/role
 * @desc    Update user role
 * @access  Private (Admin)
 */
router.put(
    '/:id/role',
    authenticate,
    requireRole('admin'),
    validateId,
    [
        body('role').isIn(['member', 'librarian', 'admin']).withMessage('Invalid role'),
        handleValidationErrors
    ],
    asyncHandler(usersController.updateUserRole)
);

/**
 * @route   POST /api/users/:id/reset-password
 * @desc    Reset user password
 * @access  Private (Admin)
 */
router.post(
    '/:id/reset-password',
    authenticate,
    requireRole('admin'),
    validateId,
    [
        body('new_password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        handleValidationErrors
    ],
    asyncHandler(usersController.resetPassword)
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, requireRole('admin'), validateId, asyncHandler(usersController.deleteUser));

module.exports = router;
