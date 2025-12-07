let currentPage = 1;
let currentFilters = {
    search: '',
    category: '',
    available: ''
};

const loadCategories = async () => {
    try {
        const data = await apiRequest('/categories');
        const select = document.getElementById('category-filter');

        data.data.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
};

const loadBooks = async (page = 1) => {
    const loading = document.getElementById('loading');
    const booksGrid = document.getElementById('books-grid');
    const errorMessage = document.getElementById('error-message');

    loading.style.display = 'block';
    booksGrid.innerHTML = '';
    errorMessage.style.display = 'none';

    try {
        const params = new URLSearchParams({
            page: page,
            limit: 12,
            ...currentFilters
        });

        const data = await apiRequest(`/books?${params}`);

        loading.style.display = 'none';

        if (data.data.books.length === 0) {
            booksGrid.innerHTML = '<p class="text-center">No books found.</p>';
            return;
        }

        data.data.books.forEach(book => {
            const bookCard = createBookCard(book);
            booksGrid.appendChild(bookCard);
        });

        renderPagination(data.data.pagination);

    } catch (error) {
        loading.style.display = 'none';
        showError('error-message', error.message);
    }
};

const createBookCard = (book) => {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.onclick = () => viewBookDetails(book.id);

    const availabilityClass = book.available_copies > 0 ? 'available' : 'unavailable';
    const availabilityText = book.available_copies > 0
        ? `${book.available_copies} available`
        : 'Not available';

    card.innerHTML = `
        <h3 class="book-title">${book.title}</h3>
        <p class="book-author">by ${book.authors || 'Unknown'}</p>
        <p><strong>ISBN:</strong> ${book.isbn || 'N/A'}</p>
        <p><strong>Publisher:</strong> ${book.publisher || 'N/A'}</p>
        <p><strong>Year:</strong> ${book.publication_year || 'N/A'}</p>
        <p class="book-categories"><strong>Categories:</strong> ${book.categories || 'N/A'}</p>
        <p><span class="book-availability ${availabilityClass}">${availabilityText}</span></p>
    `;

    return card;
};

const viewBookDetails = async (bookId) => {
    const modal = document.getElementById('book-modal');
    const detailsContainer = document.getElementById('book-details');

    modal.style.display = 'block';
    modal.classList.add('active');
    detailsContainer.innerHTML = '<div class="loading">Loading book details...</div>';

    try {
        const data = await apiRequest(`/books/${bookId}`);
        const book = data.data;

        const user = getUser();
        const availabilityClass = book.available_copies > 0 ? 'available' : 'unavailable';
        const availabilityText = book.available_copies > 0
            ? `${book.available_copies} of ${book.total_copies} available`
            : 'Not available';

        let actionsHTML = '';
        if (user) {
            if (book.available_copies > 0) {
                actionsHTML = `<button onclick="borrowBook(${book.id})" class="btn btn-primary">Borrow Book</button>`;
            } else {
                actionsHTML = `<button onclick="reserveBook(${book.id})" class="btn btn-secondary">Reserve Book</button>`;
            }
        }

        const authorsHTML = book.authors.map(a => a.name).join(', ');
        const categoriesHTML = book.categories.map(c => c.name).join(', ');

        detailsContainer.innerHTML = `
            <h2>${book.title}</h2>
            <p><strong>Authors:</strong> ${authorsHTML}</p>
            <p><strong>ISBN:</strong> ${book.isbn || 'N/A'}</p>
            <p><strong>Publisher:</strong> ${book.publisher || 'N/A'}</p>
            <p><strong>Year:</strong> ${book.publication_year || 'N/A'}</p>
            <p><strong>Categories:</strong> ${categoriesHTML}</p>
            <p><strong>Description:</strong></p>
            <p>${book.description || 'No description available.'}</p>
            <p><span class="book-availability ${availabilityClass}">${availabilityText}</span></p>
            <div class="alert" id="book-action-message" style="display: none;"></div>
            ${actionsHTML}
        `;
    } catch (error) {
        detailsContainer.innerHTML = `<p class="alert alert-error">${error.message}</p>`;
    }
};

const borrowBook = async (bookId) => {
    try {
        const data = await apiRequest('/loans', {
            method: 'POST',
            body: JSON.stringify({ book_id: bookId })
        });

        showSuccess('book-action-message', `Book borrowed successfully! Due date: ${formatDate(data.data.due_date)}`);

        setTimeout(() => {
            window.location.reload();
        }, 2000);
    } catch (error) {
        showError('book-action-message', error.message);
    }
};

const reserveBook = async (bookId) => {
    try {
        const data = await apiRequest('/reservations', {
            method: 'POST',
            body: JSON.stringify({ book_id: bookId })
        });

        showSuccess('book-action-message', `Book reserved successfully! Queue position: ${data.data.queue_position}`);

        setTimeout(() => {
            window.location.reload();
        }, 2000);
    } catch (error) {
        showError('book-action-message', error.message);
    }
};

const renderPagination = (pagination) => {
    const container = document.getElementById('pagination');
    container.innerHTML = '';

    const { page, totalPages } = pagination;

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← Previous';
    prevBtn.disabled = page === 1;
    prevBtn.onclick = () => {
        currentPage = page - 1;
        loadBooks(currentPage);
    };
    container.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.className = i === page ? 'active' : '';
            pageBtn.onclick = () => {
                currentPage = i;
                loadBooks(currentPage);
            };
            container.appendChild(pageBtn);
        } else if (i === page - 3 || i === page + 3) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.style.padding = '0 8px';
            container.appendChild(dots);
        }
    }

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next →';
    nextBtn.disabled = page === totalPages;
    nextBtn.onclick = () => {
        currentPage = page + 1;
        loadBooks(currentPage);
    };
    container.appendChild(nextBtn);
};

document.querySelector('.close')?.addEventListener('click', () => {
    const modal = document.getElementById('book-modal');
    modal.style.display = 'none';
    modal.classList.remove('active');
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('book-modal');
    if (e.target === modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
});

document.getElementById('search-btn')?.addEventListener('click', () => {
    currentFilters.search = document.getElementById('search-input').value;
    currentFilters.category = document.getElementById('category-filter').value;
    currentFilters.available = document.getElementById('availability-filter').value;
    currentPage = 1;
    loadBooks(currentPage);
});

document.getElementById('clear-btn')?.addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    document.getElementById('category-filter').value = '';
    document.getElementById('availability-filter').value = '';
    currentFilters = { search: '', category: '', available: '' };
    currentPage = 1;
    loadBooks(currentPage);
});

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadBooks(1);
});
