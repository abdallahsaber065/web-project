/**
 * Books Controller
 * 
 * Handles CRUD operations for books, search, and filtering.
 */

const { pool } = require('../config/database');

// Helper: ensure author names exist and return their IDs
async function getOrCreateAuthorIdsByNames(names, client) {
    const ids = [];
    const seen = new Set();
    for (let name of names) {
        if (!name) continue;
        name = String(name).trim().replace(/\s+/g, ' ');
        if (!name) continue;
        const lowerName = name.toLowerCase();
        if (seen.has(lowerName)) continue; // avoid duplicates
        seen.add(lowerName);

        // Try to find existing author by case-insensitive match
        const result = await client.query(
            'SELECT id FROM authors WHERE LOWER(name) = LOWER($1) LIMIT 1',
            [name]
        );

        if (result.rows.length > 0) {
            ids.push(result.rows[0].id);
            continue;
        }

        // Insert new author
        const insertResult = await client.query(
            'INSERT INTO authors (name) VALUES ($1) RETURNING id',
            [name]
        );
        ids.push(insertResult.rows[0].id);
    }
    return ids;
}

// Helper: ensure category names exist and return their IDs
async function getOrCreateCategoryIdsByNames(names, client) {
    const ids = [];
    const seen = new Set();
    for (let name of names) {
        if (!name) continue;
        name = String(name).trim().replace(/\s+/g, ' ');
        if (!name) continue;
        const lowerName = name.toLowerCase();
        if (seen.has(lowerName)) continue;
        seen.add(lowerName);

        const result = await client.query(
            'SELECT id FROM categories WHERE LOWER(name) = LOWER($1) LIMIT 1',
            [name]
        );

        if (result.rows.length > 0) {
            ids.push(result.rows[0].id);
            continue;
        }

        // Insert new category
        const insertResult = await client.query(
            'INSERT INTO categories (name) VALUES ($1) RETURNING id',
            [name]
        );
        ids.push(insertResult.rows[0].id);
    }
    return ids;
}

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
                STRING_AGG(DISTINCT a.name, ', ' ORDER BY a.name) AS authors,
                STRING_AGG(DISTINCT c.name, ', ' ORDER BY c.name) AS categories
            FROM books b
            LEFT JOIN book_authors ba ON b.id = ba.book_id
            LEFT JOIN authors a ON ba.author_id = a.id
            LEFT JOIN book_categories bc ON b.id = bc.book_id
            LEFT JOIN categories c ON bc.category_id = c.id
            WHERE 1=1
        `;

        const params = [];
        let paramIndex = 1;

        // Add search filter
        if (search) {
            query += ` AND (b.title ILIKE $${paramIndex} OR b.isbn ILIKE $${paramIndex + 1} OR b.description ILIKE $${paramIndex + 2})`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
            paramIndex += 3;
        }

        // Add author filter
        if (author) {
            query += ` AND a.name ILIKE $${paramIndex}`;
            params.push(`%${author}%`);
            paramIndex++;
        }

        // Add category filter
        if (category) {
            query += ` AND c.name ILIKE $${paramIndex}`;
            params.push(`%${category}%`);
            paramIndex++;
        }

        // Add availability filter
        if (available === 'true') {
            query += ` AND b.available_copies > 0`;
        } else if (available === 'false') {
            query += ` AND b.available_copies = 0`;
        }

        query += ` GROUP BY b.id ORDER BY b.title LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(parseInt(limit), parseInt(offset));

        const booksResult = await pool.query(query, params);

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
        let countParamIndex = 1;
        if (search) {
            countQuery += ` AND (b.title ILIKE $${countParamIndex} OR b.isbn ILIKE $${countParamIndex + 1} OR b.description ILIKE $${countParamIndex + 2})`;
            const searchPattern = `%${search}%`;
            countParams.push(searchPattern, searchPattern, searchPattern);
            countParamIndex += 3;
        }
        if (author) {
            countQuery += ` AND a.name ILIKE $${countParamIndex}`;
            countParams.push(`%${author}%`);
            countParamIndex++;
        }
        if (category) {
            countQuery += ` AND c.name ILIKE $${countParamIndex}`;
            countParams.push(`%${category}%`);
            countParamIndex++;
        }
        if (available === 'true') {
            countQuery += ` AND b.available_copies > 0`;
        } else if (available === 'false') {
            countQuery += ` AND b.available_copies = 0`;
        }

        const countResult = await pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].total);

        res.json({
            success: true,
            data: {
                books: booksResult.rows,
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
        const result = await pool.query(
            `SELECT 
                b.id,
                b.isbn,
                b.title,
                b.description,
                b.publisher,
                b.publication_year,
                b.total_copies,
                b.available_copies,
                STRING_AGG(DISTINCT a.id || ':' || a.name, '||') AS authors,
                STRING_AGG(DISTINCT c.id || ':' || c.name, '||') AS categories
            FROM books b
            LEFT JOIN book_authors ba ON b.id = ba.book_id
            LEFT JOIN authors a ON ba.author_id = a.id
            LEFT JOIN book_categories bc ON b.id = bc.book_id
            LEFT JOIN categories c ON bc.category_id = c.id
            WHERE b.id = $1
            GROUP BY b.id`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        const book = result.rows[0];

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
        author_names,
        category_ids = [],
        category_names
    } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Insert book
        const result = await client.query(
            `INSERT INTO books (isbn, title, description, publisher, publication_year, total_copies, available_copies)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [isbn, title, description, publisher, publication_year, total_copies, total_copies]
        );

        const bookId = result.rows[0].id;

        // Prepare authors: accept author_ids or author_names
        let authorIdsArray = [];
        if (author_ids && Array.isArray(author_ids)) {
            authorIdsArray = author_ids.map(id => parseInt(id)).filter(Boolean);
        } else if (typeof author_ids === 'string' && author_ids.trim() !== '') {
            authorIdsArray = author_ids.split(',').map(s => parseInt(s.trim())).filter(Boolean);
        }

        // If author_names provided, create or find those authors
        if (author_names) {
            const names = Array.isArray(author_names) ? author_names : (String(author_names).split(',').map(s => s.trim()).filter(Boolean));
            const newIds = await getOrCreateAuthorIdsByNames(names, client);
            authorIdsArray = Array.from(new Set([...authorIdsArray, ...newIds]));
        }

        // Insert book-author relationships
        for (const authorId of authorIdsArray) {
            await client.query(
                'INSERT INTO book_authors (book_id, author_id) VALUES ($1, $2)',
                [bookId, authorId]
            );
        }
        // Prepare categories: accept category_ids or category_names
        let categoryIdsArray = [];
        if (category_ids && Array.isArray(category_ids)) {
            categoryIdsArray = category_ids.map(id => parseInt(id)).filter(Boolean);
        } else if (typeof category_ids === 'string' && category_ids.trim() !== '') {
            categoryIdsArray = category_ids.split(',').map(s => parseInt(s.trim())).filter(Boolean);
        }

        if (category_names) {
            const catNames = Array.isArray(category_names) ? category_names : (String(category_names).split(',').map(s => s.trim()).filter(Boolean));
            const newCatIds = await getOrCreateCategoryIdsByNames(catNames, client);
            categoryIdsArray = Array.from(new Set([...categoryIdsArray, ...newCatIds]));
        }

        // Insert book-category relationships
        for (const categoryId of categoryIdsArray) {
            await client.query(
                'INSERT INTO book_categories (book_id, category_id) VALUES ($1, $2)',
                [bookId, categoryId]
            );
        }

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Book created successfully',
            data: { id: bookId }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
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
        author_names,
        category_ids,
        category_names
    } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Check if book exists
        const booksResult = await client.query('SELECT id, available_copies FROM books WHERE id = $1', [id]);
        if (booksResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        const currentAvailableCopies = booksResult.rows[0].available_copies;
        const currentTotalCopies = total_copies !== undefined ? total_copies : null;

        // Calculate new available copies if total_copies changed
        let newAvailableCopies = currentAvailableCopies;
        if (currentTotalCopies !== null) {
            const difference = currentTotalCopies - currentAvailableCopies;
            newAvailableCopies = Math.max(0, currentTotalCopies - difference);
        }

        // Update book
        await client.query(
            `UPDATE books 
             SET isbn = COALESCE($1, isbn),
                 title = COALESCE($2, title),
                 description = COALESCE($3, description),
                 publisher = COALESCE($4, publisher),
                 publication_year = COALESCE($5, publication_year),
                 total_copies = COALESCE($6, total_copies),
                 available_copies = $7
             WHERE id = $8`,
            [
                isbn !== undefined ? isbn : null,
                title !== undefined ? title : null,
                description !== undefined ? description : null,
                publisher !== undefined ? publisher : null,
                publication_year !== undefined ? publication_year : null,
                total_copies !== undefined ? total_copies : null,
                newAvailableCopies,
                id
            ]
        );

        // Update authors if provided (accept ids or names)
        let authorIdsArray = [];
        if (author_ids && Array.isArray(author_ids)) {
            authorIdsArray = author_ids.map(id => parseInt(id)).filter(Boolean);
        } else if (typeof author_ids === 'string' && author_ids.trim() !== '') {
            authorIdsArray = author_ids.split(',').map(s => parseInt(s.trim())).filter(Boolean);
        }

        if (author_names) {
            const names = Array.isArray(author_names) ? author_names : (String(author_names).split(',').map(s => s.trim()).filter(Boolean));
            const newIds = await getOrCreateAuthorIdsByNames(names, client);
            authorIdsArray = Array.from(new Set([...authorIdsArray, ...newIds]));
        }

        if (authorIdsArray.length > 0) {
            await client.query('DELETE FROM book_authors WHERE book_id = $1', [id]);
            for (const authorId of authorIdsArray) {
                await client.query(
                    'INSERT INTO book_authors (book_id, author_id) VALUES ($1, $2)',
                    [id, authorId]
                );
            }
        }

        // Update categories if provided (accept ids or names)
        let categoryIdsArray = [];
        if (category_ids && Array.isArray(category_ids)) {
            categoryIdsArray = category_ids.map(id => parseInt(id)).filter(Boolean);
        } else if (typeof category_ids === 'string' && category_ids.trim() !== '') {
            categoryIdsArray = category_ids.split(',').map(s => parseInt(s.trim())).filter(Boolean);
        }

        if (category_names) {
            const names = Array.isArray(category_names) ? category_names : (String(category_names).split(',').map(s => s.trim()).filter(Boolean));
            const newIds = await getOrCreateCategoryIdsByNames(names, client);
            categoryIdsArray = Array.from(new Set([...categoryIdsArray, ...newIds]));
        }

        if (categoryIdsArray.length > 0) {
            await client.query('DELETE FROM book_categories WHERE book_id = $1', [id]);
            for (const categoryId of categoryIdsArray) {
                await client.query(
                    'INSERT INTO book_categories (book_id, category_id) VALUES ($1, $2)',
                    [id, categoryId]
                );
            }
        }

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Book updated successfully'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
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
        const loansResult = await pool.query(
            'SELECT COUNT(*) AS count FROM loans WHERE book_id = $1 AND return_date IS NULL',
            [id]
        );

        if (parseInt(loansResult.rows[0].count) > 0) {
            return res.status(409).json({
                success: false,
                message: 'Cannot delete book with active loans'
            });
        }

        const result = await pool.query('DELETE FROM books WHERE id = $1', [id]);

        if (result.rowCount === 0) {
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
