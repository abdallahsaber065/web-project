/**
 * Users Controller
 * 
 * Handles user management operations (Admin only).
 */

const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

/**
 * Get all users (Admin only)
 * GET /api/users
 */
const getAllUsers = async (req, res) => {
    const { role } = req.query;

    try {
        let query = 'SELECT id, name, email, role, created_at FROM users WHERE 1=1';
        const params = [];

        if (role) {
            query += ' AND role = ?';
            params.push(role);
        }

        query += ' ORDER BY created_at DESC';

        const [users] = await pool.execute(query, params);

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        throw error;
    }
};

/**
 * Get user by ID (Admin only)
 * GET /api/users/:id
 */
const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const [users] = await pool.execute(
            'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user's loan statistics
        const [stats] = await pool.execute(
            `SELECT 
                COUNT(*) AS total_loans,
                SUM(CASE WHEN return_date IS NULL THEN 1 ELSE 0 END) AS active_loans,
                SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) AS overdue_loans,
                SUM(fine_amount) AS total_fines
            FROM loans
            WHERE user_id = ?`,
            [id]
        );

        res.json({
            success: true,
            data: {
                ...users[0],
                statistics: stats[0]
            }
        });
    } catch (error) {
        throw error;
    }
};

/**
 * Update user role (Admin only)
 * PUT /api/users/:id/role
 */
const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!['member', 'librarian', 'admin'].includes(role)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid role. Must be member, librarian, or admin'
        });
    }

    try {
        const [result] = await pool.execute(
            'UPDATE users SET role = ? WHERE id = ?',
            [role, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User role updated successfully'
        });
    } catch (error) {
        throw error;
    }
};

/**
 * Delete user (Admin only)
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        // Check for active loans
        const [loans] = await pool.execute(
            'SELECT COUNT(*) AS count FROM loans WHERE user_id = ? AND return_date IS NULL',
            [id]
        );

        if (loans[0].count > 0) {
            return res.status(409).json({
                success: false,
                message: 'Cannot delete user with active loans'
            });
        }

        const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        throw error;
    }
};

/**
 * Reset user password (Admin only)
 * POST /api/users/:id/reset-password
 */
const resetPassword = async (req, res) => {
    const { id } = req.params;
    const { new_password } = req.body;

    if (!new_password || new_password.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters'
        });
    }

    try {
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(new_password, saltRounds);

        const [result] = await pool.execute(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [password_hash, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
    resetPassword
};
