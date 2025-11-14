/**
 * Main JavaScript - Common utilities and functions
 */

// API base URL
const API_URL = '/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Get user from localStorage
const getUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

// Set auth data
const setAuth = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
};

// Clear auth data
const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// Check if user is authenticated
const isAuthenticated = () => !!getToken();

// Logout function
const logout = () => {
    clearAuth();
    window.location.href = '/login';
};

// API request helper
const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        }
    };

    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json();

        // Handle unauthorized
        if (response.status === 401) {
            clearAuth();
            window.location.href = '/login';
            throw new Error('Session expired. Please login again.');
        }

        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }

        return data;
    } catch (error) {
        throw error;
    }
};

// Show error message
const showError = (elementId, message) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        element.className = 'alert alert-error';
    }
};

// Show success message
const showSuccess = (elementId, message) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        element.className = 'alert alert-success';
    }
};

// Hide message
const hideMessage = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
};

// Format date
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    let date;
    // If format is YYYY-MM-DD (SQL DATE), append a time to ensure consistent parsing
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(dateString))) {
        date = new Date(`${dateString}T00:00:00`);
    } else {
        date = new Date(dateString);
    }

    if (isNaN(date)) {
        // fallback to original string if parsing failed
        return String(dateString);
    }

    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Render navigation based on auth status
const renderNavigation = (navId = 'navbar') => {
    const navbar = document.getElementById(navId);
    if (!navbar) return;

    const user = getUser();

    let navHTML = `
        <div class="container">
            <div class="nav-brand">
                <h1>📚 Library</h1>
            </div>
            <ul class="nav-menu">
                <li><a href="/">Home</a></li>
                <li><a href="/catalog">Catalog</a></li>
    `;

    if (user) {
        navHTML += `
                <li><a href="/dashboard">Dashboard</a></li>
        `;

        if (user.role === 'admin' || user.role === 'librarian') {
            navHTML += `
                <li><a href="/admin">Admin</a></li>
                <li><a href="/reports">Reports</a></li>
            `;
        }

        navHTML += `
            </ul>
            <div class="nav-user">
                <span>Welcome, ${user.name}</span>
                <button onclick="logout()" class="btn btn-secondary">Logout</button>
            </div>
        `;
    } else {
        navHTML += `
                <li><a href="/login">Login</a></li>
                <li><a href="/register">Register</a></li>
            </ul>
        `;
    }

    navHTML += '</div>';
    navbar.innerHTML = navHTML;
};

// Check authentication and redirect if needed
const requireAuth = (requiredRole = null) => {
    const user = getUser();

    if (!user) {
        window.location.href = '/login';
        return false;
    }

    if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
        alert('You do not have permission to access this page.');
        window.location.href = '/dashboard';
        return false;
    }

    return true;
};

// Initialize navigation on page load
document.addEventListener('DOMContentLoaded', () => {
    renderNavigation();
});
