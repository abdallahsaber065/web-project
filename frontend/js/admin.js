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
                    <td>$${Number(loan.fine_amount || 0).toFixed(2)}</td>
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

// Add book button
document.getElementById('add-book-btn')?.addEventListener('click', () => {
    const modal = document.getElementById('book-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('book-form');
    
    modalTitle.textContent = 'Add New Book';
    form.reset();
    form.dataset.mode = 'add';
    delete form.dataset.bookId;
    
    modal.style.display = 'block';
    modal.classList.add('active');
});

// Edit book function
const editBook = async (bookId) => {
    try {
        const data = await apiRequest(`/books/${bookId}`);
        const book = data.data;
        
        const modal = document.getElementById('book-modal');
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('book-form');
        
        modalTitle.textContent = 'Edit Book';
        form.dataset.mode = 'edit';
        form.dataset.bookId = bookId;
        
        // Populate form fields
        document.getElementById('book-title').value = book.title || '';
        document.getElementById('book-isbn').value = book.isbn || '';
        document.getElementById('book-publisher').value = book.publisher || '';
        document.getElementById('book-year').value = book.publication_year || '';
        document.getElementById('book-total-copies').value = book.total_copies || 1;
        document.getElementById('book-available-copies').value = book.available_copies || 1;
        document.getElementById('book-description').value = book.description || '';
        
        modal.style.display = 'block';
        modal.classList.add('active');
    } catch (error) {
        alert('Error loading book: ' + error.message);
    }
};

// Handle book form submission
document.getElementById('book-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const mode = form.dataset.mode;
    const bookId = form.dataset.bookId;
    
    const bookData = {
        title: document.getElementById('book-title').value,
        isbn: document.getElementById('book-isbn').value,
        publisher: document.getElementById('book-publisher').value,
        publication_year: parseInt(document.getElementById('book-year').value) || null,
        total_copies: parseInt(document.getElementById('book-total-copies').value) || 1,
        available_copies: parseInt(document.getElementById('book-available-copies').value) || 1,
        description: document.getElementById('book-description').value
    };
    
    try {
        if (mode === 'add') {
            await apiRequest('/books', {
                method: 'POST',
                body: JSON.stringify(bookData)
            });
            alert('Book added successfully!');
        } else {
            await apiRequest(`/books/${bookId}`, {
                method: 'PUT',
                body: JSON.stringify(bookData)
            });
            alert('Book updated successfully!');
        }
        
        // Close modal and reload books
        document.getElementById('book-modal').style.display = 'none';
        document.getElementById('book-modal').classList.remove('active');
        loadAllBooks();
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// Close modal handlers
document.querySelector('.close')?.addEventListener('click', () => {
    document.getElementById('book-modal').style.display = 'none';
    document.getElementById('book-modal').classList.remove('active');
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('book-modal');
    if (e.target === modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
});

// Load books by default
document.addEventListener('DOMContentLoaded', () => {
    loadAllBooks();
});
