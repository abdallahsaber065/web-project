/**
 * Database Configuration
 * 
 * Establishes PostgreSQL connection pool using environment variables.
 * Uses promise-based pg for async/await support.
 */

const { Pool } = require('pg');
require('dotenv').config();

/**
 * Create PostgreSQL connection pool
 * Pool automatically manages connections, improves performance
 */
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'library_management',
    max: 10, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000 // Return error after 2 seconds if connection not established
});

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
