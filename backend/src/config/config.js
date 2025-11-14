/**
 * Application Configuration
 * 
 * Centralized configuration for the entire application.
 * All configurable values should be defined here.
 */

require('dotenv').config();

module.exports = {
    // Server configuration
    server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development'
    },

    // JWT configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'default_secret_change_in_production',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },

    // Library business rules
    library: {
        finePerDay: parseFloat(process.env.FINE_PER_DAY) || 0.50,
        loanDurationDays: parseInt(process.env.LOAN_DURATION_DAYS) || 14,
        maxLoansPerUser: parseInt(process.env.MAX_LOANS_PER_USER) || 5
    },

    // Database configuration
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        name: process.env.DB_NAME || 'library_management'
    },

    // CORS configuration
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true
    }
};
