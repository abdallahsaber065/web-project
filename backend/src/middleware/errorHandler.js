/**
 * Error Handling Middleware
 * 
 * Centralized error handling for consistent error responses.
 * Should be the last middleware in the chain.
 */

/**
 * Not Found Handler
 * Catches requests to undefined routes
 */
const notFound = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
};

/**
 * Global Error Handler
 * Catches all errors passed via next(error)
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Default error status and message
    let status = err.status || 500;
    let message = err.message || 'Internal server error';

    // MySQL/Database errors
    if (err.code) {
        switch (err.code) {
            case 'ER_DUP_ENTRY':
                status = 409;
                message = 'Duplicate entry. Resource already exists.';
                if (err.sqlMessage && err.sqlMessage.includes('email')) {
                    message = 'Email already registered.';
                }
                if (err.sqlMessage && err.sqlMessage.includes('isbn')) {
                    message = 'Book with this ISBN already exists.';
                }
                break;

            case 'ER_NO_REFERENCED_ROW':
            case 'ER_NO_REFERENCED_ROW_2':
                status = 400;
                message = 'Invalid reference. Related resource does not exist.';
                break;

            case 'ER_ROW_IS_REFERENCED':
            case 'ER_ROW_IS_REFERENCED_2':
                status = 409;
                message = 'Cannot delete. Resource is referenced by other records.';
                break;

            case 'ER_BAD_FIELD_ERROR':
                status = 400;
                message = 'Invalid field in query.';
                break;

            case 'ER_PARSE_ERROR':
                status = 400;
                message = 'Query syntax error.';
                break;

            case 'ECONNREFUSED':
                status = 503;
                message = 'Database connection refused.';
                break;

            default:
                // Keep default error for unknown codes
                break;
        }
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        status = 401;
        message = 'Invalid authentication token.';
    }

    if (err.name === 'TokenExpiredError') {
        status = 401;
        message = 'Authentication token expired.';
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        status = 400;
        message = err.message;
    }

    // Send error response
    res.status(status).json({
        success: false,
        message: message,
        ...(process.env.NODE_ENV === 'development' && {
            error: err.message,
            stack: err.stack
        })
    });
};

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors automatically
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    notFound,
    errorHandler,
    asyncHandler
};
