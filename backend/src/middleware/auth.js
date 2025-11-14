/**
 * Authentication Middleware
 * 
 * Verifies JWT tokens and protects routes.
 * Adds user information to request object.
 */

const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Verify JWT token and authenticate user
 * Adds decoded user data to req.user
 */
const authenticate = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Extract token (remove 'Bearer ' prefix)
        const token = authHeader.substring(7);

        // Verify token
        const decoded = jwt.verify(token, config.jwt.secret);

        // Add user info to request object
        req.user = decoded;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Authentication error.'
        });
    }
};

/**
 * Check if user has required role
 * Usage: requireRole('admin') or requireRole(['admin', 'librarian'])
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        const userRole = req.user.role;
        const roles = allowedRoles.flat(); // Flatten array in case of nested arrays

        if (!roles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions. Required role: ' + roles.join(' or ')
            });
        }

        next();
    };
};

/**
 * Optional authentication
 * Adds user info if token is present, but doesn't require it
 */
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = jwt.verify(token, config.jwt.secret);
            req.user = decoded;
        }
    } catch (error) {
        // Ignore errors for optional auth
    }
    next();
};

module.exports = {
    authenticate,
    requireRole,
    optionalAuth
};
