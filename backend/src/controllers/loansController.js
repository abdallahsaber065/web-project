/**
 * Loans Controller
 * 
 * Handles borrowing and returning books, fine calculation.
 */

const { pool } = require('../config/database');
const config = require('../config/config');

/**
 * Borrow a book
 * POST /api/loans
 */
const borrowBook = async (req, res) => {
    const { book_id } = req.body;
    const user_id = req.user.id;

    try {
        // Call stored procedure to borrow book
        const [result] = await pool.execute(
            'CALL sp_borrow_book(?, ?, ?)',
            [user_id, book_id, config.library.loanDurationDays]
        );

        const loanId = result[0][0].loan_id;

        // Get loan details
        const [loans] = await pool.execute(
            `SELECT l.*, b.title AS book_title, b.isbn
             FROM loans l
             JOIN books b ON l.book_id = b.id
             WHERE l.id = ?`,
            [loanId]
        );

        res.status(201).json({
            success: true,
            message: 'Book borrowed successfully',
            data: loans[0]
        });
    } catch (error) {
        // Handle stored procedure errors
        if (error.sqlMessage) {
            return res.status(400).json({
                success: false,
                message: error.sqlMessage
            });
        }
        throw error;
    }
};

/**
 * Return a book
 * POST /api/loans/:id/return
 */
const returnBook = async (req, res) => {
    const { id } = req.params;

    try {
        // Call stored procedure to return book
        const [result] = await pool.execute(
            'CALL sp_return_book(?, ?)',
            [id, config.library.finePerDay]
        );

        const { fine_amount, days_late } = result[0][0];

        res.json({
            success: true,
            message: 'Book returned successfully',
            data: {
                loan_id: id,
                fine_amount,
                days_late: days_late > 0 ? days_late : 0
            }
        });
    } catch (error) {
        if (error.sqlMessage) {
            return res.status(400).json({
                success: false,
                message: error.sqlMessage
            });
        }
        throw error;
    }
};

/**
 * Get user's loans
 * GET /api/loans/my-loans
 */
const getMyLoans = async (req, res) => {
    const user_id = req.user.id;
    const { status } = req.query;

    try {
        let query = `
            SELECT 
                l.id,
                l.book_id,
                b.title AS book_title,
                b.isbn,
                l.borrow_date,
                l.due_date,
                l.return_date,
                l.status,
                l.fine_amount,
                DATEDIFF(CURDATE(), l.due_date) AS days_overdue
            FROM loans l
            JOIN books b ON l.book_id = b.id
            WHERE l.user_id = ?
        `;

        const params = [user_id];

        if (status) {
            query += ' AND l.status = ?';
            params.push(status);
        }

        query += ' ORDER BY l.borrow_date DESC';

        const [loans] = await pool.execute(query, params);

        res.json({
            success: true,
            data: loans
        });
    } catch (error) {
        throw error;
    }
};

/**
 * Get all loans (Admin/Librarian only)
 * GET /api/loans
 */
const getAllLoans = async (req, res) => {
    const { status, user_id, overdue } = req.query;

    try {
        let query = `
            SELECT 
                l.id,
                l.user_id,
                u.name AS user_name,
                u.email AS user_email,
                l.book_id,
                b.title AS book_title,
                b.isbn,
                l.borrow_date,
                l.due_date,
                l.return_date,
                l.status,
                l.fine_amount,
                DATEDIFF(CURDATE(), l.due_date) AS days_overdue
            FROM loans l
            JOIN users u ON l.user_id = u.id
            JOIN books b ON l.book_id = b.id
            WHERE 1=1
        `;

        const params = [];

        if (status) {
            query += ' AND l.status = ?';
            params.push(status);
        }

        if (user_id) {
            query += ' AND l.user_id = ?';
            params.push(user_id);
        }

        if (overdue === 'true') {
            query += ' AND l.return_date IS NULL AND l.due_date < CURDATE()';
        }

        query += ' ORDER BY l.borrow_date DESC';

        const [loans] = await pool.execute(query, params);

        res.json({
            success: true,
            data: loans
        });
    } catch (error) {
        throw error;
    }
};

/**
 * Get loan by ID
 * GET /api/loans/:id
 */
const getLoanById = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;
    const user_role = req.user.role;

    try {
        let query = `
            SELECT 
                l.id,
                l.user_id,
                u.name AS user_name,
                u.email AS user_email,
                l.book_id,
                b.title AS book_title,
                b.isbn,
                l.borrow_date,
                l.due_date,
                l.return_date,
                l.status,
                l.fine_amount,
                DATEDIFF(CURDATE(), l.due_date) AS days_overdue
            FROM loans l
            JOIN users u ON l.user_id = u.id
            JOIN books b ON l.book_id = b.id
            WHERE l.id = ?
        `;

        const params = [id];

        // Members can only see their own loans
        if (user_role === 'member') {
            query += ' AND l.user_id = ?';
            params.push(user_id);
        }

        const [loans] = await pool.execute(query, params);

        if (loans.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Loan not found'
            });
        }

        res.json({
            success: true,
            data: loans[0]
        });
    } catch (error) {
        throw error;
    }
};

module.exports = {
    borrowBook,
    returnBook,
    getMyLoans,
    getAllLoans,
    getLoanById
};
