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
        const [authors] = await pool.execute(
            'SELECT id, name, biography, created_at FROM authors ORDER BY name'
        );

        res.json({
            success: true,
            data: authors
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
        const [authors] = await pool.execute(
            'SELECT id, name, biography, created_at FROM authors WHERE id = ?',
            [id]
        );

        if (authors.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Author not found'
            });
        }

        // Get books by this author
        const [books] = await pool.execute(
            `SELECT b.id, b.title, b.isbn
             FROM books b
             JOIN book_authors ba ON b.id = ba.book_id
             WHERE ba.author_id = ?`,
            [id]
        );

        res.json({
            success: true,
            data: {
                ...authors[0],
                books
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
        const [result] = await pool.execute(
            'INSERT INTO authors (name, biography) VALUES (?, ?)',
            [name, biography || null]
        );

        res.status(201).json({
            success: true,
            message: 'Author created successfully',
            data: { id: result.insertId }
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
        const [result] = await pool.execute(
            'UPDATE authors SET name = COALESCE(?, name), biography = COALESCE(?, biography) WHERE id = ?',
            [name, biography, id]
        );

        if (result.affectedRows === 0) {
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
        const [result] = await pool.execute('DELETE FROM authors WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
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
        const [categories] = await pool.execute(
            'SELECT id, name, description FROM categories ORDER BY name'
        );

        res.json({
            success: true,
            data: categories
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
        const [categories] = await pool.execute(
            'SELECT id, name, description FROM categories WHERE id = ?',
            [id]
        );

        if (categories.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            data: categories[0]
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
        const [result] = await pool.execute(
            'INSERT INTO categories (name, description) VALUES (?, ?)',
            [name, description || null]
        );

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: { id: result.insertId }
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
        const [result] = await pool.execute(
            'UPDATE categories SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?',
            [name, description, id]
        );

        if (result.affectedRows === 0) {
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
        const [result] = await pool.execute('DELETE FROM categories WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
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
