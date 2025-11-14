/**
 * Admin Panel - Manage books, users, and view reports
 */

// Check authentication and role
const user = getUser();
if (!requireAuth() || (user.role !== 'admin' && user.role !== 'librarian')) {
    alert('Access denied. Admin or Librarian role required.');
    window.location.href = '/dashboard';
}

// Tab switching
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;

        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(tc => tc.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Load data based on tab
        if (tabName === 'statistics') {
            loadStatistics();
        } else if (tabName === 'books') {
            loadAllBooks();
        } else if (tabName === 'loans') {
            loadAllLoans();
        } else if (tabName === 'users' && user.role === 'admin') {
            loadAllUsers();
        }
    });
});

// Load statistics
const loadStatistics = async () => {
    const loading = document.getElementById('stats-loading');
    const statsGrid = document.getElementById('stats-grid');

    loading.style.display = 'block';

    try {
        const data = await apiRequest('/reports/statistics');
        const stats = data.data;

        loading.style.display = 'none';

        statsGrid.innerHTML = `
            <div class="stat-item">
                <h3>${stats.books.unique_titles}</h3>
                <p>Unique Titles</p>
            </div>
            <div class="stat-item">
                <h3>${stats.books.total_copies}</h3>
                <p>Total Copies</p>
            </div>
            <div class="stat-item">
                <h3>${stats.books.available_copies}</h3>
                <p>Available Copies</p>
            </div>
            <div class="stat-item">
                <h3>${stats.loans.active}</h3>
                <p>Active Loans</p>
            </div>
            <div class="stat-item">
                <h3>${stats.loans.overdue}</h3>
                <p>Overdue Loans</p>
            </div>
            <div class="stat-item">
                <h3>${stats.reservations.active}</h3>
                <p>Active Reservations</p>
            </div>
            <div class="stat-item">
                <h3>${stats.members.total}</h3>
                <p>Total Members</p>
            </div>
            <div class="stat-item">
                <h3>$${stats.fines.outstanding}</h3>
                <p>Outstanding Fines</p>
            </div>
        `;
    } catch (error) {
        loading.style.display = 'none';
        statsGrid.innerHTML = `<p class="alert alert-error">${error.message}</p>`;
    }
};

// Load all books (for management)
const loadAllBooks = async () => {
    const loading = document.getElementById('books-loading');
    const container = document.getElementById('books-table-container');

    loading.style.display = 'block';

    try {
        const data = await apiRequest('/books?limit=100');

        loading.style.display = 'none';

        let tableHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>ISBN</th>
                            <th>Total Copies</th>
                            <th>Available</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.data.books.forEach(book => {
            tableHTML += `
                <tr>
                    <td>${book.id}</td>
                    <td>${book.title}</td>
                    <td>${book.isbn || 'N/A'}</td>
                    <td>${book.total_copies}</td>
                    <td>${book.available_copies}</td>
                    <td>
                        <button onclick="editBook(${book.id})" class="btn btn-secondary">Edit</button>
                        ${user.role === 'admin' ? `<button onclick="deleteBook(${book.id})" class="btn btn-danger">Delete</button>` : ''}
                    </td>
                </tr>
            `;
        });

        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = tableHTML;
    } catch (error) {
        loading.style.display = 'none';
        container.innerHTML = `<p class="alert alert-error">${error.message}</p>`;
    }
};

// Load all loans
const loadAllLoans = async (status = '') => {
    const loading = document.getElementById('loans-loading');
    const container = document.getElementById('loans-table-container');

    loading.style.display = 'block';

    try {
        const params = status ? `?status=${status}` : '';
        const data = await apiRequest(`/loans${params}`);

        loading.style.display = 'none';

        let tableHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User</th>
                            <th>Book</th>
                            <th>Borrow Date</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Fine</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.data.forEach(loan => {
            tableHTML += `
                <tr>
                    <td>${loan.id}</td>
                    <td>${loan.user_name}</td>
                    <td>${loan.book_title}</td>
                    <td>${formatDate(loan.borrow_date)}</td>
                    <td>${formatDate(loan.due_date)}</td>
                    <td>${loan.status}</td>
                    <td>$${loan.fine_amount.toFixed(2)}</td>
                </tr>
            `;
        });

        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = tableHTML;
    } catch (error) {
        loading.style.display = 'none';
        container.innerHTML = `<p class="alert alert-error">${error.message}</p>`;
    }
};

// Load all users (admin only)
const loadAllUsers = async () => {
    const loading = document.getElementById('users-loading');
    const container = document.getElementById('users-table-container');

    loading.style.display = 'block';

    try {
        const data = await apiRequest('/users');

        loading.style.display = 'none';

        let tableHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.data.forEach(u => {
            tableHTML += `
                <tr>
                    <td>${u.id}</td>
                    <td>${u.name}</td>
                    <td>${u.email}</td>
                    <td>${u.role}</td>
                    <td>
                        <button onclick="deleteUser(${u.id})" class="btn btn-danger">Delete</button>
                    </td>
                </tr>
            `;
        });

        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = tableHTML;
    } catch (error) {
        loading.style.display = 'none';
        container.innerHTML = `<p class="alert alert-error">${error.message}</p>`;
    }
};

// Delete book (admin only)
const deleteBook = async (bookId) => {
    if (!confirm('Are you sure you want to delete this book?')) {
        return;
    }

    try {
        await apiRequest(`/books/${bookId}`, {
            method: 'DELETE'
        });

        alert('Book deleted successfully!');
        loadAllBooks();
    } catch (error) {
        alert('Error: ' + error.message);
    }
};

// Delete user (admin only)
const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

    try {
        await apiRequest(`/users/${userId}`, {
            method: 'DELETE'
        });

        alert('User deleted successfully!');
        loadAllUsers();
    } catch (error) {
        alert('Error: ' + error.message);
    }
};

// Filter loans
document.getElementById('filter-loans-btn')?.addEventListener('click', () => {
    const status = document.getElementById('loan-status-filter').value;
    loadAllLoans(status);
});

// Report buttons
document.getElementById('most-borrowed-btn')?.addEventListener('click', async () => {
    try {
        const data = await apiRequest('/reports/most-borrowed?limit=10');
        const container = document.getElementById('most-borrowed-result');

        let html = '<table><thead><tr><th>Title</th><th>Authors</th><th>Borrow Count</th></tr></thead><tbody>';
        data.data.forEach(book => {
            html += `<tr><td>${book.title}</td><td>${book.authors || 'N/A'}</td><td>${book.borrow_count}</td></tr>`;
        });
        html += '</tbody></table>';

        container.innerHTML = html;
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

document.getElementById('overdue-btn')?.addEventListener('click', async () => {
    try {
        const data = await apiRequest('/reports/overdue');
        const container = document.getElementById('overdue-result');

        let html = '<table><thead><tr><th>User</th><th>Book</th><th>Days Overdue</th><th>Fine</th></tr></thead><tbody>';
        data.data.forEach(loan => {
            html += `<tr><td>${loan.user_name}</td><td>${loan.book_title}</td><td>${loan.days_overdue}</td><td>$${loan.calculated_fine.toFixed(2)}</td></tr>`;
        });
        html += '</tbody></table>';

        container.innerHTML = html;
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

document.getElementById('member-activity-btn')?.addEventListener('click', async () => {
    try {
        const data = await apiRequest('/reports/member-activity');
        const container = document.getElementById('member-activity-result');

        let html = '<table><thead><tr><th>Name</th><th>Total Loans</th><th>Active</th><th>Overdue</th><th>Total Fines</th></tr></thead><tbody>';
        data.data.forEach(member => {
            html += `<tr><td>${member.name}</td><td>${member.total_loans}</td><td>${member.active_loans}</td><td>${member.overdue_loans}</td><td>$${(member.total_fines || 0).toFixed(2)}</td></tr>`;
        });
        html += '</tbody></table>';

        container.innerHTML = html;
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// Add book button (simplified - would need full form)
document.getElementById('add-book-btn')?.addEventListener('click', () => {
    alert('Add book functionality would open a modal form. For demo, use API directly or implement full form.');
});

// Load statistics by default
document.addEventListener('DOMContentLoaded', () => {
    loadStatistics();
});
