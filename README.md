# Library Management System

A comprehensive web-based library management system built with Node.js, MySQL, and vanilla JavaScript. This project implements a complete library management solution with user authentication, book catalog, borrowing system, reservations, and administrative features.

## 🎓 University Project

This is a full-stack web development project for a university course demonstrating:

- Backend development with Node.js and Express.js
- Database design and implementation with MySQL
- Frontend development with vanilla HTML, CSS, and JavaScript (no frameworks)
- RESTful API design
- Authentication and authorization
- Automated testing

## ✨ Features

### For Members

- 📚 Browse and search book catalog
- 🔍 Advanced filtering (by category, author, availability)
- 📖 Borrow and return books
- 📅 View borrowing history
- 💰 Automatic fine calculation for overdue books
- 🔖 Reserve unavailable books
- 👤 Manage personal profile

### For Librarians

- ➕ Add, edit, and manage books
- 👥 View all loans and reservations
- 📊 Access reports and statistics
- 📈 Monitor library activity

### For Administrators

- 🔐 Full system access
- 👨‍💼 User management
- 🗑️ Delete books and users
- 📊 Comprehensive analytics
- 💵 Fine management

## 🛠️ Tech Stack

### Backend

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js v4.18.2
- **Database:** MySQL v8+ with MySQL2 driver
- **Authentication:** JWT (jsonwebtoken), bcrypt
- **Validation:** express-validator v7.0.1
- **Testing:** Jest v29.7.0, Supertest v6.3.3

### Frontend

- **HTML5** - Semantic markup
- **CSS3** - Mobile-first responsive design with CSS variables
- **JavaScript (ES6+)** - Vanilla JavaScript (no frameworks per course requirements)

### Database Features

- 8 normalized tables
- 3 database views for complex queries
- 3 stored procedures for business logic
- 1 trigger for automatic updates
- Proper indexing and foreign key constraints

## 📁 Project Structure

```
web/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and app configuration
│   │   ├── controllers/     # Business logic and request handlers
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── routes/          # API route definitions
│   │   └── server.js        # Main application entry point
│   └── tests/               # Automated test suites (Jest)
├── db/
│   ├── schema.sql           # Complete database schema
│   └── seed.sql             # Sample data for testing
├── docs/
│   ├── api.md               # Complete API documentation
│   ├── setup.md             # Installation and deployment guide
│   ├── tests.md             # Testing procedures
│   ├── problem-statement.md # Project requirements
│   ├── erd.md               # Database ERD diagram
│   └── use-cases.md         # Use case diagrams
├── frontend/
│   ├── css/
│   │   └── main.css         # Complete responsive styling
│   ├── js/
│   │   ├── main.js          # Common utilities and API helpers
│   │   ├── auth.js          # Login/registration functionality
│   │   ├── catalog.js       # Book browsing and search
│   │   ├── dashboard.js     # User dashboard
│   │   └── admin.js         # Admin panel
│   ├── index.html           # Home page
│   ├── login.html           # Login page
│   ├── register.html        # Registration page
│   ├── catalog.html         # Book catalog
│   ├── dashboard.html       # User dashboard
│   └── admin.html           # Admin panel
├── .env.example             # Environment variables template
├── .gitignore
├── CHANGELOG.md             # Version history
├── jest.config.js           # Testing configuration
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js v18 or higher
- MySQL v8 or higher
- npm (comes with Node.js)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd web
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up the database**

   ```bash
   # Create database
   mysql -u root -p -e "CREATE DATABASE library_db;"
   
   # Run schema
   mysql -u root -p library_db < db/schema.sql
   
   # Load sample data (optional)
   mysql -u root -p library_db < db/seed.sql
   ```

4. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and JWT secret
   ```

5. **Run the application**

   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   - Frontend: <http://localhost:3000>
   - API: <http://localhost:3000/api>

### Default Accounts (after running seed.sql)

**Admin:**

- Email: <admin@library.com>
- Password: Admin123!@#

**Librarian:**

- Email: <sarah.johnson@library.com>
- Password: Password123!@#

**Member:**

- Email: <john.doe@email.com>
- Password: Password123!@#

## 🧪 Testing

Run automated tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm test -- --coverage
```

Run specific test file:

```bash
npm test -- auth.test.js
```

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[Setup Guide](docs/setup.md)** - Complete installation and deployment instructions
- **[API Documentation](docs/api.md)** - All API endpoints with examples
- **[Testing Guide](docs/tests.md)** - Automated and manual testing procedures
- **[Problem Statement](docs/problem-statement.md)** - Project requirements and objectives
- **[ERD Diagram](docs/erd.md)** - Database entity relationship diagram
- **[Use Cases](docs/use-cases.md)** - System use case diagrams

## 🎯 Key Features Implementation

### Authentication & Authorization

- JWT-based authentication
- Role-based access control (member, librarian, admin)
- Password hashing with bcrypt
- Protected routes with middleware

### Book Management

- Complete CRUD operations
- Advanced search and filtering
- Pagination support
- Category and author management
- Book availability tracking

### Borrowing System

- Automated borrowing with stored procedures
- 14-day loan period
- Automatic fine calculation ($0.50/day)
- Transaction-safe operations
- Overdue loan tracking

### Reservation System

- Queue management
- Position tracking
- Automatic cancellation
- Member notifications

### Reports & Analytics

- Most borrowed books
- Overdue loans with fines
- Member activity statistics
- Library-wide statistics
- Date-range reporting

## 🔐 Security Features

- Password hashing (bcrypt with salt rounds)
- JWT token authentication
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection
- CORS configuration
- Environment variable protection

## 📱 Responsive Design

The frontend is built with mobile-first approach:

- Responsive grid layouts
- Breakpoints: 480px, 768px, 1024px
- Touch-friendly interface
- Accessible navigation

## 🧰 API Endpoints

Base URL: `http://localhost:3000/api`

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT
- `GET /auth/profile` - Get user profile

### Books

- `GET /books` - Get all books (with filters)
- `GET /books/:id` - Get book details
- `POST /books` - Create book (librarian/admin)
- `PUT /books/:id` - Update book (librarian/admin)
- `DELETE /books/:id` - Delete book (admin)

### Loans

- `POST /loans/borrow` - Borrow a book
- `POST /loans/:id/return` - Return a book
- `GET /loans/my-loans` - Get user's loans
- `GET /loans` - Get all loans (admin)

### Reservations

- `POST /reservations` - Create reservation
- `GET /reservations/my-reservations` - Get user's reservations
- `DELETE /reservations/:id` - Cancel reservation

### Reports (Admin/Librarian)

- `GET /reports/statistics` - Library statistics
- `GET /reports/most-borrowed` - Most borrowed books
- `GET /reports/overdue` - Overdue loans
- `GET /reports/member-activity` - Member activity

See [API Documentation](docs/api.md) for complete details.

## 🐛 Troubleshooting

### Common Issues

**MySQL Connection Error:**

- Verify database credentials in `.env`
- Ensure MySQL server is running
- Check database name exists

**Port Already in Use:**

- Change PORT in `.env` file
- Stop other applications using port 3000

**JWT Token Error:**

- Ensure JWT_SECRET is set in `.env`
- Check token hasn't expired (default: 7 days)

See [Setup Guide](docs/setup.md#troubleshooting) for more solutions.

## 📄 License

This project is created for educational purposes as a university project.

## 👥 Contributing

This is a university project. For educational review only.

## 📞 Support

For issues or questions, please refer to:

1. [Setup Guide](docs/setup.md)
2. [API Documentation](docs/api.md)
3. [Testing Guide](docs/tests.md)

## Setup Instructions

See [docs/setup.md](docs/setup.md) for detailed installation and setup instructions.

## API Documentation

See [docs/api.md](docs/api.md) for complete API reference.

## License

MIT
