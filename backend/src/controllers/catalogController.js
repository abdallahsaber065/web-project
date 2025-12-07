/**
 * Authors and Categories Controller
 * 
 * Handles CRUD operations for authors and categories.
 */

const { pool } = require('../config/database');

// ==================== AUTHORS ====================

/**
 * Get all authors
 * GET /api/authors
 */
const getAuthors = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, biography, created_at FROM authors ORDER BY name'
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
 * Get author by ID
 * GET /api/authors/:id
 */
const getAuthorById = async (req, res) => {
    const { id } = req.params;

    try {
        const authorsResult = await pool.query(
            'SELECT id, name, biography, created_at FROM authors WHERE id = $1',
            [id]
        );

        if (authorsResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Author not found'
            });
        }

        // Get books by this author
        const booksResult = await pool.query(
            `SELECT b.id, b.title, b.isbn
             FROM books b
             JOIN book_authors ba ON b.id = ba.book_id
             WHERE ba.author_id = $1`,
            [id]
        );

        res.json({
            success: true,
            data: {
                ...authorsResult.rows[0],
                books: booksResult.rows
            }
        });
    } catch (error) {
        throw error;
    }
};

/**
 * Create new author (Admin/Librarian only)
 * POST /api/authors
 */
const createAuthor = async (req, res) => {
    const { name, biography } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO authors (name, biography) VALUES ($1, $2) RETURNING id',
            [name, biography || null]
        );

        res.status(201).json({
            success: true,
            message: 'Author created successfully',
            data: { id: result.rows[0].id }
        });
    } catch (error) {
        throw error;
    }
};

/**
 * Update author (Admin/Librarian only)
 * PUT /api/authors/:id
 */
const updateAuthor = async (req, res) => {
    const { id } = req.params;
    const { name, biography } = req.body;

    try {
        const result = await pool.query(
            'UPDATE authors SET name = COALESCE($1, name), biography = COALESCE($2, biography) WHERE id = $3',
            [name, biography, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Author not found'
            });
        }

        res.json({
            success: true,
            message: 'Author updated successfully'
        });
    } catch (error) {
        throw error;
    }
};

/**
 * Delete author (Admin only)
 * DELETE /api/authors/:id
 */
const deleteAuthor = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM authors WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Author not found'
            });
        }

        res.json({
            success: true,
            message: 'Author deleted successfully'
        });
    } catch (error) {
        throw error;
    }
};

// ==================== CATEGORIES ====================

/**
 * Get all categories
 * GET /api/categories
 */
const getCategories = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, description FROM categories ORDER BY name'
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
 * Get category by ID
 * GET /api/categories/:id
 */
const getCategoryById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'SELECT id, name, description FROM categories WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        throw error;
    }
};

/**
 * Create new category (Admin/Librarian only)
 * POST /api/categories
 */
const createCategory = async (req, res) => {
    const { name, description } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
            [name, description || null]
        );

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: { id: result.rows[0].id }
        });
    } catch (error) {
        throw error;
    }
};

/**
 * Update category (Admin/Librarian only)
 * PUT /api/categories/:id
 */
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
        const result = await pool.query(
            'UPDATE categories SET name = COALESCE($1, name), description = COALESCE($2, description) WHERE id = $3',
            [name, description, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            message: 'Category updated successfully'
        });
    } catch (error) {
        throw error;
    }
};

/**
 * Delete category (Admin only)
 * DELETE /api/categories/:id
 */
const deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM categories WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getAuthors,
    getAuthorById,
    createAuthor,
    updateAuthor,
    deleteAuthor,
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
