/**
 * Books Controller
 * 
 * Handles CRUD operations for books, search, and filtering.
 */

const { pool } = require('../config/database');

/**
 * Get all books with pagination and filters
 * GET /api/books
 */
const getBooks = async (req, res) => {
    const {
        page = 1,
        limit = 10,
        search = '',
        author = '',
        category = '',
        available = ''
    } = req.query;

    const offset = (page - 1) * limit;

    try {
        let query = `
            SELECT DISTINCT
                b.id,
                b.isbn,
                b.title,
                b.description,
                b.publisher,
                b.publication_year,
                b.total_copies,
                b.available_copies,
                GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR ', ') AS authors,
                GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ') AS categories
            FROM books b
            LEFT JOIN book_authors ba ON b.id = ba.book_id
            LEFT JOIN authors a ON ba.author_id = a.id
            LEFT JOIN book_categories bc ON b.id = bc.book_id
            LEFT JOIN categories c ON bc.category_id = c.id
            WHERE 1=1
        `;

        const params = [];

        // Add search filter
        if (search) {
            query += ` AND (b.title LIKE ? OR b.isbn LIKE ? OR b.description LIKE ?)`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        // Add author filter
        if (author) {
            query += ` AND a.name LIKE ?`;
            params.push(`%${author}%`);
        }

        // Add category filter
        if (category) {
            query += ` AND c.name LIKE ?`;
            params.push(`%${category}%`);
        }

        // Add availability filter
        if (available === 'true') {
            query += ` AND b.available_copies > 0`;
        } else if (available === 'false') {
            query += ` AND b.available_copies = 0`;
        }

        query += ` GROUP BY b.id ORDER BY b.title LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [books] = await pool.execute(query, params);

        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(DISTINCT b.id) AS total
            FROM books b
            LEFT JOIN book_authors ba ON b.id = ba.book_id
            LEFT JOIN authors a ON ba.author_id = a.id
            LEFT JOIN book_categories bc ON b.id = bc.book_id
            LEFT JOIN categories c ON bc.category_id = c.id
            WHERE 1=1
        `;

        const countParams = [];
        if (search) {
            countQuery += ` AND (b.title LIKE ? OR b.isbn LIKE ? OR b.description LIKE ?)`;
            const searchPattern = `%${search}%`;
            countParams.push(searchPattern, searchPattern, searchPattern);
        }
        if (author) {
            countQuery += ` AND a.name LIKE ?`;
            countParams.push(`%${author}%`);
        }
        if (category) {
            countQuery += ` AND c.name LIKE ?`;
            countParams.push(`%${category}%`);
        }
        if (available === 'true') {
            countQuery += ` AND b.available_copies > 0`;
        } else if (available === 'false') {
            countQuery += ` AND b.available_copies = 0`;
        }

        const [countResult] = await pool.execute(countQuery, countParams);
        const total = countResult[0].total;

        res.json({
            success: true,
            data: {
                books,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        throw error;
    }
};

/**
 * Get book by ID
 * GET /api/books/:id
 */
const getBookById = async (req, res) => {
    const { id } = req.params;

    try {
        const [books] = await pool.execute(
            `SELECT 
                b.id,
                b.isbn,
                b.title,
                b.description,
                b.publisher,
                b.publication_year,
                b.total_copies,
                b.available_copies,
                GROUP_CONCAT(DISTINCT CONCAT(a.id, ':', a.name) SEPARATOR '||') AS authors,
                GROUP_CONCAT(DISTINCT CONCAT(c.id, ':', c.name) SEPARATOR '||') AS categories
            FROM books b
            LEFT JOIN book_authors ba ON b.id = ba.book_id
            LEFT JOIN authors a ON ba.author_id = a.id
            LEFT JOIN book_categories bc ON b.id = bc.book_id
            LEFT JOIN categories c ON bc.category_id = c.id
            WHERE b.id = ?
            GROUP BY b.id`,
            [id]
        );

        if (books.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        const book = books[0];

        // Parse authors and categories
        book.authors = book.authors
            ? book.authors.split('||').map(a => {
                const [id, name] = a.split(':');
                return { id: parseInt(id), name };
            })
            : [];

        book.categories = book.categories
            ? book.categories.split('||').map(c => {
                const [id, name] = c.split(':');
                return { id: parseInt(id), name };
            })
            : [];

        res.json({
            success: true,
            data: book
        });
    } catch (error) {
        throw error;
    }
};

/**
 * Create a new book (Admin/Librarian only)
 * POST /api/books
 */
const createBook = async (req, res) => {
    const {
        isbn,
        title,
        description,
        publisher,
        publication_year,
        total_copies,
        author_ids,
        category_ids = []
    } = req.body;

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Insert book
        const [result] = await connection.execute(
            `INSERT INTO books (isbn, title, description, publisher, publication_year, total_copies, available_copies)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [isbn, title, description, publisher, publication_year, total_copies, total_copies]
        );

        const bookId = result.insertId;

        // Insert book-author relationships
        for (const authorId of author_ids) {
            await connection.execute(
                'INSERT INTO book_authors (book_id, author_id) VALUES (?, ?)',
                [bookId, authorId]
            );
        }

        // Insert book-category relationships
        for (const categoryId of category_ids) {
            await connection.execute(
                'INSERT INTO book_categories (book_id, category_id) VALUES (?, ?)',
                [bookId, categoryId]
            );
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Book created successfully',
            data: { id: bookId }
        });
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Update a book (Admin/Librarian only)
 * PUT /api/books/:id
 */
const updateBook = async (req, res) => {
    const { id } = req.params;
    const {
        isbn,
        title,
        description,
        publisher,
        publication_year,
        total_copies,
        author_ids,
        category_ids
    } = req.body;

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Check if book exists
        const [books] = await connection.execute('SELECT id, available_copies FROM books WHERE id = ?', [id]);
        if (books.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        const currentAvailableCopies = books[0].available_copies;
        const currentTotalCopies = total_copies !== undefined ? total_copies : null;

        // Calculate new available copies if total_copies changed
        let newAvailableCopies = currentAvailableCopies;
        if (currentTotalCopies !== null) {
            const difference = currentTotalCopies - currentAvailableCopies;
            newAvailableCopies = Math.max(0, currentTotalCopies - difference);
        }

        // Update book
        await connection.execute(
            `UPDATE books 
             SET isbn = COALESCE(?, isbn),
                 title = COALESCE(?, title),
                 description = COALESCE(?, description),
                 publisher = COALESCE(?, publisher),
                 publication_year = COALESCE(?, publication_year),
                 total_copies = COALESCE(?, total_copies),
                 available_copies = ?
             WHERE id = ?`,
            [isbn, title, description, publisher, publication_year, total_copies, newAvailableCopies, id]
        );

        // Update authors if provided
        if (author_ids && Array.isArray(author_ids)) {
            await connection.execute('DELETE FROM book_authors WHERE book_id = ?', [id]);
            for (const authorId of author_ids) {
                await connection.execute(
                    'INSERT INTO book_authors (book_id, author_id) VALUES (?, ?)',
                    [id, authorId]
                );
            }
        }

        // Update categories if provided
        if (category_ids && Array.isArray(category_ids)) {
            await connection.execute('DELETE FROM book_categories WHERE book_id = ?', [id]);
            for (const categoryId of category_ids) {
                await connection.execute(
                    'INSERT INTO book_categories (book_id, category_id) VALUES (?, ?)',
                    [id, categoryId]
                );
            }
        }

        await connection.commit();

        res.json({
            success: true,
            message: 'Book updated successfully'
        });
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Delete a book (Admin only)
 * DELETE /api/books/:id
 */
const deleteBook = async (req, res) => {
    const { id } = req.params;

    try {
        // Check for active loans
        const [loans] = await pool.execute(
            'SELECT COUNT(*) AS count FROM loans WHERE book_id = ? AND return_date IS NULL',
            [id]
        );

        if (loans[0].count > 0) {
            return res.status(409).json({
                success: false,
                message: 'Cannot delete book with active loans'
            });
        }

        const [result] = await pool.execute('DELETE FROM books WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        res.json({
            success: true,
            message: 'Book deleted successfully'
        });
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook
};
