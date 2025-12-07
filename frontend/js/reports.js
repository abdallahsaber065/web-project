let currentReport = 'statistics';

const initSidebarNavigation = () => {
    const links = document.querySelectorAll('.sidebar-link');

    links.forEach(link => {
        link.addEventListener('click', function () {
            const reportType = this.dataset.report;

            document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            loadReport(reportType);
        });
    });
};

const loadReport = async (reportType) => {
    currentReport = reportType;
    const config = reportConfigs[reportType];

    if (!config) {
        console.error('Report config not found for:', reportType);
        return;
    }

    document.getElementById('report-title').textContent = config.title;
    document.getElementById('report-description').textContent = config.description;

    document.getElementById('report-content').innerHTML = '';
    document.getElementById('report-error').style.display = 'none';

    await config.loader();
};

const loadStatisticsReport = async () => {
    const loading = document.getElementById('report-loading');
    const content = document.getElementById('report-content');
    const errorElement = document.getElementById('report-error');

    loading.style.display = 'block';

    try {
        const data = await apiRequest('/reports/statistics');
        const stats = data.data;

        loading.style.display = 'none';

        content.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>${stats.books?.unique_titles || 0}</h3>
                    <p>Total Books</p>
                </div>
                <div class="stat-card">
                    <h3>${stats.members?.total || 0}</h3>
                    <p>Total Members</p>
                </div>
                <div class="stat-card">
                    <h3>${stats.loans?.active || 0}</h3>
                    <p>Active Loans</p>
                </div>
                <div class="stat-card">
                    <h3>${stats.loans?.overdue || 0}</h3>
                    <p>Overdue Loans</p>
                </div>
                <div class="stat-card">
                    <h3>${stats.reservations?.active || 0}</h3>
                    <p>Active Reservations</p>
                </div>
                <div class="stat-card">
                    <h3>$${stats.fines?.outstanding || '0.00'}</h3>
                    <p>Outstanding Fines</p>
                </div>
                <div class="stat-card">
                    <h3>${stats.books?.total_copies || 0}</h3>
                    <p>Total Copies</p>
                </div>
                <div class="stat-card">
                    <h3>${stats.books?.available_copies || 0}</h3>
                    <p>Available Copies</p>
                </div>
            </div>
        `;
    } catch (error) {
        loading.style.display = 'none';
        errorElement.textContent = error.message;
        errorElement.style.display = 'block';
    }
};

const loadMostBorrowedReport = async () => {
    const loading = document.getElementById('report-loading');
    const content = document.getElementById('report-content');
    const errorElement = document.getElementById('report-error');

    loading.style.display = 'block';

    try {
        const data = await apiRequest('/reports/most-borrowed');

        loading.style.display = 'none';

        let tableHTML = `
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Title</th>
                        <th>Author(s)</th>
                        <th>ISBN</th>
                        <th>Times Borrowed</th>
                        <th>Available Copies</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.data.forEach((book, index) => {
            tableHTML += `
                <tr>
                    <td><strong>${index + 1}</strong></td>
                    <td>${book.title}</td>
                    <td>${book.authors || 'N/A'}</td>
                    <td>${book.isbn || 'N/A'}</td>
                    <td><strong>${book.borrow_count}</strong></td>
                    <td>${book.available_copies}/${book.total_copies}</td>
                </tr>
            `;
        });

        tableHTML += '</tbody></table>';

        if (data.data.length === 0) {
            content.innerHTML = '<p>No data available.</p>';
        } else {
            content.innerHTML = tableHTML;
        }
    } catch (error) {
        loading.style.display = 'none';
        errorElement.textContent = error.message;
        errorElement.style.display = 'block';
    }
};

const loadOverdueReport = async () => {
    const loading = document.getElementById('report-loading');
    const content = document.getElementById('report-content');
    const errorElement = document.getElementById('report-error');

    loading.style.display = 'block';

    try {
        const data = await apiRequest('/reports/overdue');

        loading.style.display = 'none';

        let tableHTML = `
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Member</th>
                        <th>Email</th>
                        <th>Book</th>
                        <th>Due Date</th>
                        <th>Days Overdue</th>
                        <th>Fine Amount</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.data.forEach(loan => {
            tableHTML += `
                <tr>
                    <td>${loan.user_name}</td>
                    <td>${loan.user_email}</td>
                    <td>${loan.book_title}</td>
                    <td>${formatDate(loan.due_date)}</td>
                    <td><strong style="color: var(--accent-color);">${loan.days_overdue} days</strong></td>
                    <td><strong style="color: var(--accent-color);">$${Number(loan.calculated_fine || 0).toFixed(2)}</strong></td>
                </tr>
            `;
        });

        tableHTML += '</tbody></table>';

        if (data.data.length === 0) {
            content.innerHTML = '<p>No overdue loans.</p>';
        } else {
            content.innerHTML = tableHTML;
        }
    } catch (error) {
        loading.style.display = 'none';
        errorElement.textContent = error.message;
        errorElement.style.display = 'block';
    }
};

const loadMemberActivityReport = async () => {
    const loading = document.getElementById('report-loading');
    const content = document.getElementById('report-content');
    const errorElement = document.getElementById('report-error');

    loading.style.display = 'block';

    try {
        const data = await apiRequest('/reports/member-activity');

        loading.style.display = 'none';

        let tableHTML = `
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Member Name</th>
                        <th>Email</th>
                        <th>Total Loans</th>
                        <th>Active Loans</th>
                        <th>Overdue Loans</th>
                        <th>Total Fines</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.data.forEach(member => {
            tableHTML += `
                <tr>
                    <td>${member.name}</td>
                    <td>${member.email}</td>
                    <td>${member.total_loans}</td>
                    <td>${member.active_loans}</td>
                    <td>${member.overdue_loans}</td>
                    <td>$${Number(member.total_fines || 0).toFixed(2)}</td>
                </tr>
            `;
        });

        tableHTML += '</tbody></table>';

        if (data.data.length === 0) {
            content.innerHTML = '<p>No member activity data available.</p>';
        } else {
            content.innerHTML = tableHTML;
        }
    } catch (error) {
        loading.style.display = 'none';
        errorElement.textContent = error.message;
        errorElement.style.display = 'block';
    }
};

const loadLoansByDateReport = async () => {
    const content = document.getElementById('report-content');

    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    content.innerHTML = `
        <div class="date-filter">
            <div class="form-group">
                <label for="start-date">Start Date</label>
                <input type="date" id="start-date" value="${thirtyDaysAgo}">
            </div>
            <div class="form-group">
                <label for="end-date">End Date</label>
                <input type="date" id="end-date" value="${today}">
            </div>
            <button id="load-date-report" class="btn btn-primary">Load Report</button>
        </div>
        <div id="date-report-results"></div>
    `;

    document.getElementById('load-date-report').addEventListener('click', async () => {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const resultsContainer = document.getElementById('date-report-results');
        const loading = document.getElementById('report-loading');
        const errorElement = document.getElementById('report-error');

        if (!startDate || !endDate) {
            alert('Please select both start and end dates');
            return;
        }

        loading.style.display = 'block';
        resultsContainer.innerHTML = '';
        errorElement.style.display = 'none';

        try {
            const data = await apiRequest(`/reports/loans-by-date?start_date=${startDate}&end_date=${endDate}`);

            loading.style.display = 'none';

            let tableHTML = `
                <h4 style="margin-top: var(--spacing-lg); margin-bottom: var(--spacing-md);">
                    Loans from ${formatDate(startDate)} to ${formatDate(endDate)}
                </h4>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Total Loans</th>
                            <th>Unique Users</th>
                            <th>Unique Books</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            data.data.forEach(row => {
                tableHTML += `
                    <tr>
                        <td>${formatDate(row.date)}</td>
                        <td><strong>${row.loans_count}</strong></td>
                        <td>${row.unique_users}</td>
                        <td>${row.unique_books}</td>
                    </tr>
                `;
            });

            tableHTML += '</tbody></table>';

            if (data.data.length === 0) {
                resultsContainer.innerHTML = '<p>No loans found for the selected date range.</p>';
            } else {
                resultsContainer.innerHTML = tableHTML;
            }
        } catch (error) {
            loading.style.display = 'none';
            errorElement.textContent = error.message;
            errorElement.style.display = 'block';
        }
    });

    document.getElementById('load-date-report').click();
};
const reportConfigs = {
    statistics: {
        title: 'Library Statistics',
        description: 'Overview of library operations and statistics',
        loader: loadStatisticsReport
    },
    'most-borrowed': {
        title: 'Most Borrowed Books',
        description: 'Books with the highest borrowing rates',
        loader: loadMostBorrowedReport
    },
    overdue: {
        title: 'Overdue Loans',
        description: 'Loans that are past their due date',
        loader: loadOverdueReport
    },
    'member-activity': {
        title: 'Member Activity',
        description: 'Member borrowing statistics and activity',
        loader: loadMemberActivityReport
    },
    'loans-by-date': {
        title: 'Loans by Date Range',
        description: 'Filter loans by specific date range',
        loader: loadLoansByDateReport
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const user = getUser();
    if (!requireAuth() || (user.role !== 'admin' && user.role !== 'librarian')) {
        alert('Access denied. Admin or Librarian role required.');
        window.location.href = './dashboard.html';
        return;
    }

    initSidebarNavigation();
    loadReport('statistics').catch(err => console.error('Error loading initial report:', err));

    document.querySelector('.report-header').setAttribute('data-print-date', new Date().toLocaleDateString());
});

window.addEventListener('beforeprint', () => {
    document.querySelector('.report-header').setAttribute('data-print-date', new Date().toLocaleDateString());
});
