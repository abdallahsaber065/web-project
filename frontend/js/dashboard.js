/**
 * Dashboard Page - User loans, reservations, and profile
 */

// Check authentication
if (!requireAuth()) {
    throw new Error('Authentication required');
}

// Tab switching
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;

        // Remove active class from all tabs and contents
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(tc => tc.classList.remove('active'));

        // Add active class to clicked tab and corresponding content
        tab.classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Load data based on tab
        if (tabName === 'loans') {
            loadMyLoans();
        } else if (tabName === 'reservations') {
            loadMyReservations();
        } else if (tabName === 'profile') {
            loadProfile();
        }
    });
});

// Load user's loans
const loadMyLoans = async () => {
    const loading = document.getElementById('loans-loading');
    const loansList = document.getElementById('loans-list');
    const errorElement = document.getElementById('loans-error');

    loading.style.display = 'block';
    loansList.innerHTML = '';
    errorElement.style.display = 'none';

    try {
        const data = await apiRequest('/loans/my-loans');

        loading.style.display = 'none';

        if (data.data.length === 0) {
            loansList.innerHTML = '<p>You have no loans yet.</p>';
            return;
        }

        data.data.forEach(loan => {
            const loanCard = createLoanCard(loan);
            loansList.appendChild(loanCard);
        });
    } catch (error) {
        loading.style.display = 'none';
        showError('loans-error', error.message);
    }
};

// Create loan card
const createLoanCard = (loan) => {
    const card = document.createElement('div');
    card.className = 'loan-card';

    if (loan.status === 'overdue') {
        card.classList.add('overdue');
    }

    const isActive = !loan.return_date;
    const statusBadge = loan.status === 'overdue' ? 'Overdue' :
        loan.status === 'returned' ? 'Returned' : 'Active';

    let actionButton = '';
    if (isActive) {
        actionButton = `<button onclick="returnBook(${loan.id})" class="btn btn-primary">Return Book</button>`;
    }

    let fineInfo = '';
    if (loan.fine_amount > 0) {
        fineInfo = `<p><strong>Fine:</strong> <span style="color: var(--accent-color);">$${loan.fine_amount.toFixed(2)}</span></p>`;
    }

    let overdueInfo = '';
    if (loan.status === 'overdue' && loan.days_overdue > 0) {
        overdueInfo = `<p><strong>Days Overdue:</strong> <span style="color: var(--accent-color);">${loan.days_overdue} days</span></p>`;
    }

    card.innerHTML = `
        <h4>${loan.book_title}</h4>
        <p><strong>ISBN:</strong> ${loan.isbn}</p>
        <p><strong>Borrowed:</strong> ${formatDate(loan.borrow_date)}</p>
        <p><strong>Due Date:</strong> ${formatDate(loan.due_date)}</p>
        ${loan.return_date ? `<p><strong>Returned:</strong> ${formatDate(loan.return_date)}</p>` : ''}
        <p><strong>Status:</strong> <span class="badge">${statusBadge}</span></p>
        ${overdueInfo}
        ${fineInfo}
        <div class="alert" id="return-message-${loan.id}" style="display: none;"></div>
        ${actionButton}
    `;

    return card;
};

// Return book
const returnBook = async (loanId) => {
    if (!confirm('Are you sure you want to return this book?')) {
        return;
    }

    try {
        const data = await apiRequest(`/loans/${loanId}/return`, {
            method: 'POST'
        });

        let message = 'Book returned successfully!';
        if (data.data.fine_amount > 0) {
            message += ` Fine: $${data.data.fine_amount.toFixed(2)} (${data.data.days_late} days late)`;
        }

        showSuccess(`return-message-${loanId}`, message);

        setTimeout(() => {
            loadMyLoans();
        }, 2000);
    } catch (error) {
        showError(`return-message-${loanId}`, error.message);
    }
};

// Load user's reservations
const loadMyReservations = async () => {
    const loading = document.getElementById('reservations-loading');
    const reservationsList = document.getElementById('reservations-list');
    const errorElement = document.getElementById('reservations-error');

    loading.style.display = 'block';
    reservationsList.innerHTML = '';
    errorElement.style.display = 'none';

    try {
        const data = await apiRequest('/reservations/my-reservations');

        loading.style.display = 'none';

        if (data.data.length === 0) {
            reservationsList.innerHTML = '<p>You have no active reservations.</p>';
            return;
        }

        data.data.forEach(reservation => {
            const reservationCard = createReservationCard(reservation);
            reservationsList.appendChild(reservationCard);
        });
    } catch (error) {
        loading.style.display = 'none';
        showError('reservations-error', error.message);
    }
};

// Create reservation card
const createReservationCard = (reservation) => {
    const card = document.createElement('div');
    card.className = 'reservation-card';

    let actionButton = '';
    if (reservation.status === 'active') {
        actionButton = `<button onclick="cancelReservation(${reservation.id})" class="btn btn-danger">Cancel Reservation</button>`;
    }

    card.innerHTML = `
        <h4>${reservation.book_title}</h4>
        <p><strong>ISBN:</strong> ${reservation.isbn}</p>
        <p><strong>Reserved:</strong> ${formatDate(reservation.reserved_at)}</p>
        <p><strong>Status:</strong> ${reservation.status}</p>
        <p><strong>Queue Position:</strong> ${reservation.queue_position}</p>
        <div class="alert" id="cancel-message-${reservation.id}" style="display: none;"></div>
        ${actionButton}
    `;

    return card;
};

// Cancel reservation
const cancelReservation = async (reservationId) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) {
        return;
    }

    try {
        await apiRequest(`/reservations/${reservationId}`, {
            method: 'DELETE'
        });

        showSuccess(`cancel-message-${reservationId}`, 'Reservation cancelled successfully!');

        setTimeout(() => {
            loadMyReservations();
        }, 1500);
    } catch (error) {
        showError(`cancel-message-${reservationId}`, error.message);
    }
};

// Load user profile
const loadProfile = async () => {
    const loading = document.getElementById('profile-loading');
    const profileInfo = document.getElementById('profile-info');
    const errorElement = document.getElementById('profile-error');

    loading.style.display = 'block';
    profileInfo.innerHTML = '';
    errorElement.style.display = 'none';

    try {
        const data = await apiRequest('/auth/me');
        const user = data.data;

        loading.style.display = 'none';

        profileInfo.innerHTML = `
            <h4>Profile Information</h4>
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Role:</strong> ${user.role}</p>
            <p><strong>Member Since:</strong> ${formatDate(user.created_at)}</p>
        `;
    } catch (error) {
        loading.style.display = 'none';
        showError('profile-error', error.message);
    }
};

// Set user name in header
document.addEventListener('DOMContentLoaded', () => {
    const user = getUser();
    if (user) {
        document.getElementById('user-name').textContent = user.name;
    }

    // Load loans by default
    loadMyLoans();
});
