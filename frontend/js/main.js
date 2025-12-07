const API_URL = '/api';

const getToken = () => localStorage.getItem('token');

const getUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

const setAuth = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
};

const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

const isAuthenticated = () => !!getToken();

const logout = () => {
    clearAuth();
    window.location.href = './login.html';
};

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

        if (response.status === 401) {
            clearAuth();
            window.location.href = './login.html';
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

const showError = (elementId, message) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        element.className = 'alert alert-error';
    }
};

const showSuccess = (elementId, message) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        element.className = 'alert alert-success';
    }
};

const hideMessage = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    let date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(dateString))) {
        date = new Date(`${dateString}T00:00:00`);
    } else {
        date = new Date(dateString);
    }

    if (isNaN(date)) {
        return String(dateString);
    }

    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

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
                <li><a href="index.html">Home</a></li>
                <li><a href="catalog.html">Catalog</a></li>
    `;

    if (user) {
        navHTML += `
            <li><a href="dashboard.html">Dashboard</a></li>
        `;

        if (user.role === 'admin' || user.role === 'librarian') {
            navHTML += `
                <li><a href="admin.html">Admin</a></li>
                <li><a href="reports.html">Reports</a></li>
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
                <li><a href="login.html">Login</a></li>
                <li><a href="register.html">Register</a></li>
            </ul>
        `;
    }

    navHTML += '</div>';
    navbar.innerHTML = navHTML;
};

const requireAuth = (requiredRole = null) => {
    const user = getUser();

    if (!user) {
        window.location.href = 'login.html';
        return false;
    }

    if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
        alert('You do not have permission to access this page.');
        window.location.href = './dashboard.html';
        return false;
    }

    return true;
};

document.addEventListener('DOMContentLoaded', () => {
    renderNavigation();
});
