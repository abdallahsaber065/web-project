/**
 * Express Server
 * 
 * Main application entry point.
 * Sets up Express server, middleware, routes, and error handling.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const config = require('./config/config');
const { testConnection } = require('./config/database');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const booksRoutes = require('./routes/books');
const loansRoutes = require('./routes/loans');
const reservationsRoutes = require('./routes/reservations');
const catalogRoutes = require('./routes/catalog');
const reportsRoutes = require('./routes/reports');
const usersRoutes = require('./routes/users');

// Initialize Express app
const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

// CORS - Allow cross-origin requests
app.use(cors(config.cors));

// Body parser - Parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../../frontend')));

// Request logging (development only)
if (config.server.env === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// =====================================================
// ROUTES
// =====================================================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Library Management System API is running',
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api', catalogRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/users', usersRoutes);

// Serve frontend pages for SPA-like routing
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/register.html'));
});

app.get('/catalog', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/catalog.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dashboard.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/admin.html'));
});

// =====================================================
// ERROR HANDLING
// =====================================================

// 404 handler - must be after all routes
app.use(notFound);

// Global error handler - must be last
app.use(errorHandler);

// =====================================================
// START SERVER
// =====================================================

const PORT = config.server.port;

const startServer = async () => {
    try {
        // Test database connection
        await testConnection();

        // Start Express server
        app.listen(PORT, () => {
            console.log('='.repeat(50));
            console.log('📚 Library Management System');
            console.log('='.repeat(50));
            console.log(`✓ Server running on port ${PORT}`);
            console.log(`✓ Environment: ${config.server.env}`);
            console.log(`✓ API: http://localhost:${PORT}/api`);
            console.log(`✓ Frontend: http://localhost:${PORT}`);
            console.log('='.repeat(50));
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
    startServer();
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n⚠ Shutting down gracefully...');
    process.exit(0);
});

module.exports = app;
