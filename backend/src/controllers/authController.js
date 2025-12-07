/**
 * Authentication Controller
 * 
 * Handles user registration, login, and authentication.
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const config = require('../config/config');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res) => {
    const { name, email, password, role = 'member' } = req.body;

    try {
        // Hash password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Insert user into database
        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
            [name, email, password_hash, role === 'member' ? 'member' : role]
        );

        const userId = result.rows[0].id;

        // Generate JWT token for immediate login
        const token = jwt.sign(
            {
                id: userId,
                email,
                role: role === 'member' ? 'member' : role
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user: {
                    id: userId,
                    name,
                    email,
                    role: role === 'member' ? 'member' : role
                }
            }
        });
    } catch (error) {
        throw error;
    }
};

/**
 * User login
 * POST /api/auth/login
 */
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const result = await pool.query(
            'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = result.rows[0];

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        });
    } catch (error) {
        throw error;
    }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
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

module.exports = {
    register,
    login,
    getProfile
};
