/**
 * Reports Controller
 * 
 * Handles statistical reports and analytics.
 */

const { pool } = require('../config/database');

/**
 * Get most borrowed books
 * GET /api/reports/most-borrowed
 */
const getMostBorrowed = async (req, res) => {
    const { limit = 10, days = 30 } = req.query;

    try {
        const result = await pool.query(
            `SELECT 
                b.id,
                b.title,
                b.isbn,
                b.total_copies,
                b.available_copies,
                COUNT(l.id) AS borrow_count,
                STRING_AGG(DISTINCT a.name, ', ') AS authors
            FROM books b
            JOIN loans l ON b.id = l.book_id
            LEFT JOIN book_authors ba ON b.id = ba.book_id
            LEFT JOIN authors a ON ba.author_id = a.id
            WHERE l.borrow_date >= CURRENT_DATE - $1::INTEGER
            GROUP BY b.id
            ORDER BY borrow_count DESC
            LIMIT $2`,
            [parseInt(days), parseInt(limit)]
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
 * Get overdue loans report
 * GET /api/reports/overdue
 */
const getOverdueLoans = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                l.id,
                l.user_id,
                u.name AS user_name,
                u.email AS user_email,
                l.book_id,
                b.title AS book_title,
                l.borrow_date,
                l.due_date,
                GREATEST(0, CURRENT_DATE - l.due_date) AS days_overdue,
                (GREATEST(0, CURRENT_DATE - l.due_date) * $1::DECIMAL) AS calculated_fine
            FROM loans l
            JOIN users u ON l.user_id = u.id
            JOIN books b ON l.book_id = b.id
            WHERE l.return_date IS NULL AND l.due_date < CURRENT_DATE
            ORDER BY days_overdue DESC`,
            [0.50] // Fine per day
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
 * Get member activity report
 * GET /api/reports/member-activity
 */
const getMemberActivity = async (req, res) => {
    const { days = 30 } = req.query;

    try {
        const result = await pool.query(
            `SELECT 
                u.id,
                u.name,
                u.email,
                COUNT(l.id) AS total_loans,
                SUM(CASE WHEN l.return_date IS NULL THEN 1 ELSE 0 END) AS active_loans,
                SUM(CASE WHEN l.status = 'overdue' THEN 1 ELSE 0 END) AS overdue_loans,
                SUM(l.fine_amount) AS total_fines
            FROM users u
            LEFT JOIN loans l ON u.id = l.user_id AND l.borrow_date >= CURRENT_DATE - $1::INTEGER
            WHERE u.role = 'member'
            GROUP BY u.id
            ORDER BY total_loans DESC`,
            [parseInt(days)]
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
 * Get library statistics
 * GET /api/reports/statistics
 */
const getStatistics = async (req, res) => {
    try {
        // Total books
        const totalBooksResult = await pool.query(
            'SELECT COUNT(*) AS total FROM books'
        );

        // Total copies
        const totalCopiesResult = await pool.query(
            'SELECT SUM(total_copies) AS total FROM books'
        );

        // Available copies
        const availableCopiesResult = await pool.query(
            'SELECT SUM(available_copies) AS total FROM books'
        );

        // Active loans
        const activeLoansResult = await pool.query(
            'SELECT COUNT(*) AS total FROM loans WHERE return_date IS NULL'
        );

        // Overdue loans
        const overdueLoansResult = await pool.query(
            'SELECT COUNT(*) AS total FROM loans WHERE return_date IS NULL AND due_date < CURRENT_DATE'
        );

        // Active reservations
        const activeReservationsResult = await pool.query(
            "SELECT COUNT(*) AS total FROM reservations WHERE status = 'active'"
        );

        // Total members
        const totalMembersResult = await pool.query(
            "SELECT COUNT(*) AS total FROM users WHERE role = 'member'"
        );

        // Total fines collected (returned loans)
        const totalFinesResult = await pool.query(
            'SELECT SUM(fine_amount) AS total FROM loans WHERE return_date IS NOT NULL'
        );

        // Outstanding fines
        const outstandingFinesResult = await pool.query(
            'SELECT SUM(fine_amount) AS total FROM loans WHERE return_date IS NULL AND fine_amount > 0'
        );

        res.json({
            success: true,
            data: {
                books: {
                    unique_titles: parseInt(totalBooksResult.rows[0].total),
                    total_copies: parseInt(totalCopiesResult.rows[0].total) || 0,
                    available_copies: parseInt(availableCopiesResult.rows[0].total) || 0,
                    borrowed_copies: (parseInt(totalCopiesResult.rows[0].total) || 0) - (parseInt(availableCopiesResult.rows[0].total) || 0)
                },
                loans: {
                    active: parseInt(activeLoansResult.rows[0].total),
                    overdue: parseInt(overdueLoansResult.rows[0].total)
                },
                reservations: {
                    active: parseInt(activeReservationsResult.rows[0].total)
                },
                members: {
                    total: parseInt(totalMembersResult.rows[0].total)
                },
                fines: {
                    collected: parseFloat(totalFinesResult.rows[0].total || 0).toFixed(2),
                    outstanding: parseFloat(outstandingFinesResult.rows[0].total || 0).toFixed(2)
                }
            }
        });
    } catch (error) {
        throw error;
    }
};

/**
 * Get loans by date range
 * GET /api/reports/loans-by-date
 */
const getLoansByDate = async (req, res) => {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
        return res.status(400).json({
            success: false,
            message: 'start_date and end_date are required'
        });
    }

    try {
        const result = await pool.query(
            `SELECT 
                l.borrow_date::DATE AS date,
                COUNT(*) AS loans_count,
                COUNT(DISTINCT l.user_id) AS unique_users,
                COUNT(DISTINCT l.book_id) AS unique_books
            FROM loans l
            WHERE l.borrow_date BETWEEN $1 AND $2
            GROUP BY l.borrow_date::DATE
            ORDER BY date`,
            [start_date, end_date]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getMostBorrowed,
    getOverdueLoans,
    getMemberActivity,
    getStatistics,
    getLoansByDate
};
