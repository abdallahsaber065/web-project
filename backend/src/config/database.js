/**
 * Database Configuration
 * 
 * Establishes PostgreSQL connection pool using environment variables.
 * Supports both DATABASE_URL and individual connection parameters.
 * Uses promise-based pg for async/await support.
 */

const { Pool } = require('pg');
require('dotenv').config();

/**
 * Create PostgreSQL connection pool
 * Pool automatically manages connections, improves performance
 * 
 * Supports two configuration methods:
 * 1. DATABASE_URL: Full connection string (e.g., postgresql://user:pass@host:port/db)
 * 2. Individual params: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 */
const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        // Enable SSL for production environments (e.g., Heroku, Railway)
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'library_management',
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
    };

const pool = new Pool(poolConfig);

/**
 * Test database connection
 * Logs success or failure on startup
 */
const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('✓ Database connected successfully');
        client.release();
    } catch (error) {
        console.error('✗ Database connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = { pool, testConnection };
