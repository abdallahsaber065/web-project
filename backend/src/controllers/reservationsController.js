/**
 * Reservations Controller
 * 
 * Handles book reservations and queue management.
 */

const { pool } = require('../config/database');

/**
 * Create a reservation
 * POST /api/reservations
 */
const createReservation = async (req, res) => {
    const { book_id } = req.body;
    const user_id = req.user.id;

    try {
        // Check if book is available
        const booksResult = await pool.query(
            'SELECT available_copies FROM books WHERE id = $1',
            [book_id]
        );

        if (booksResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        if (booksResult.rows[0].available_copies > 0) {
            return res.status(400).json({
                success: false,
                message: 'Book is currently available. Please borrow it instead.'
            });
        }

        // Check if user already has active reservation for this book
        const existingResult = await pool.query(
            "SELECT id FROM reservations WHERE user_id = $1 AND book_id = $2 AND status = 'active'",
            [user_id, book_id]
        );

        if (existingResult.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'You already have an active reservation for this book'
            });
        }

        // Create reservation
        const result = await pool.query(
            'INSERT INTO reservations (user_id, book_id) VALUES ($1, $2) RETURNING id',
            [user_id, book_id]
        );

        const reservationId = result.rows[0].id;

        // Get queue position
        const queueResult = await pool.query(
            `SELECT COUNT(*) + 1 AS position
             FROM reservations
             WHERE book_id = $1 AND status = 'active' AND reserved_at < (
                 SELECT reserved_at FROM reservations WHERE id = $2
             )`,
            [book_id, reservationId]
        );

        res.status(201).json({
            success: true,
            message: 'Reservation created successfully',
            data: {
                reservation_id: reservationId,
                queue_position: parseInt(queueResult.rows[0].position)
            }
        });
    } catch (error) {
        throw error;
    }
};

/**
 * Get user's reservations
 * GET /api/reservations/my-reservations
 */
const getMyReservations = async (req, res) => {
    const user_id = req.user.id;

    try {
        const result = await pool.query(
            `SELECT 
                r.id,
                r.book_id,
                b.title AS book_title,
                b.isbn,
                r.reserved_at,
                r.status,
                (SELECT COUNT(*) 
                 FROM reservations r2 
                 WHERE r2.book_id = r.book_id 
                   AND r2.status = 'active' 
                   AND r2.reserved_at < r.reserved_at) + 1 AS queue_position
            FROM reservations r
            JOIN books b ON r.book_id = b.id
            WHERE r.user_id = $1
            ORDER BY r.reserved_at DESC`,
            [user_id]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        throw error;
    }
};

/**
 * Get all reservations (Admin/Librarian only)
 * GET /api/reservations
 */
const getAllReservations = async (req, res) => {
    const { book_id, status } = req.query;

    try {
        let query = `
            SELECT 
                r.id,
                r.user_id,
                u.name AS user_name,
                u.email AS user_email,
                r.book_id,
                b.title AS book_title,
                b.isbn,
                r.reserved_at,
                r.status,
                (SELECT COUNT(*) 
                 FROM reservations r2 
                 WHERE r2.book_id = r.book_id 
                   AND r2.status = 'active' 
                   AND r2.reserved_at < r.reserved_at) + 1 AS queue_position
            FROM reservations r
            JOIN users u ON r.user_id = u.id
            JOIN books b ON r.book_id = b.id
            WHERE 1=1
        `;

        const params = [];
        let paramIndex = 1;

        if (book_id) {
            query += ` AND r.book_id = $${paramIndex}`;
            params.push(book_id);
            paramIndex++;
        }

        if (status) {
            query += ` AND r.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        query += ' ORDER BY r.book_id, r.reserved_at';

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        throw error;
    }
};

/**
 * Cancel a reservation
 * DELETE /api/reservations/:id
 */
const cancelReservation = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;
    const user_role = req.user.role;

    try {
        // Check reservation exists and belongs to user (or user is admin/librarian)
        const reservationsResult = await pool.query(
            'SELECT user_id, status FROM reservations WHERE id = $1',
            [id]
        );

        if (reservationsResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        if (user_role === 'member' && reservationsResult.rows[0].user_id !== user_id) {
            return res.status(403).json({
                success: false,
                message: 'You can only cancel your own reservations'
            });
        }

        if (reservationsResult.rows[0].status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Reservation is not active'
            });
        }

        // Update reservation status
        await pool.query(
            "UPDATE reservations SET status = 'cancelled' WHERE id = $1",
            [id]
        );

        res.json({
            success: true,
            message: 'Reservation cancelled successfully'
        });
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createReservation,
    getMyReservations,
    getAllReservations,
    cancelReservation
};
