# Changelog

All notable changes to the Library Management System project will be documented in this file.

## [2.1.0] - 2024-12-07

### Added - Netlify Deployment Support

- **Serverless Backend Configuration:**
  - Added `serverless-http` package for wrapping Express app as Netlify Function
  - Created `netlify/functions/api.js` serverless function handler
  - Updated `server.js` to detect serverless environment and skip HTTP server start
  - Updated `database.js` to handle errors gracefully in serverless mode

- **Netlify Configuration (`netlify.toml`):**
  - Configured frontend publish directory
  - Set up Functions directory with esbuild bundler
  - Added API redirect: `/api/*` → `/.netlify/functions/api/:splat`
  - Configured secrets scanner to ignore false positives (NODE_ENV, PORT, FINE_PER_DAY)

## [2.0.0] - 2024-12-07

### Changed - Database Migration from MySQL to PostgreSQL

#### Database
- **Complete migration from MySQL to PostgreSQL**
- Rewrote `db/schema.sql` for PostgreSQL syntax:
  - Changed `AUTO_INCREMENT` to `SERIAL`
  - Converted MySQL `ENUM` types to PostgreSQL custom `TYPE`
  - Changed `YEAR` column type to `SMALLINT`
  - Updated stored procedures to PostgreSQL functions using `plpgsql`
  - Replaced MySQL `DELIMITER` syntax with `$$` notation
  - Updated triggers syntax for PostgreSQL
  - Changed `GROUP_CONCAT` to `STRING_AGG`
  - Updated date functions: `CURDATE()` → `CURRENT_DATE`, `DATE_ADD/SUB` → interval arithmetic
- Rewrote `db/seed.sql` for PostgreSQL:
  - Removed `USE database` statement
  - Updated date interval syntax

#### Backend
- **Updated database driver from mysql2 to pg:**
  - Changed `package.json` dependency from `mysql2` to `pg`
  - Rewrote `backend/src/config/database.js` for PostgreSQL Pool
  - Updated default port from 3306 to 5432
- **Updated all controllers for PostgreSQL syntax:**
  - Changed parameterized query placeholders from `?` to `$1, $2, etc.`
  - Updated result destructuring: `[rows]` → `{ rows }`
  - Changed `insertId` to `RETURNING id` clause
  - Changed `affectedRows` to `rowCount`
  - Replaced `GROUP_CONCAT` with `STRING_AGG`
  - Changed `LIKE` to `ILIKE` for case-insensitive searches
  - Updated date functions throughout
  - Changed MySQL stored procedure calls to PostgreSQL function calls

#### Configuration
- Updated `.env` and `.env.example`:
  - Changed default port to 5432
  - Updated comments to reflect PostgreSQL
- Updated `backend/src/config/config.js` with PostgreSQL defaults

#### Documentation
- Updated `README.md`:
  - Changed all MySQL references to PostgreSQL
  - Updated installation instructions for PostgreSQL
  - Updated database setup commands
  - Updated tech stack section

## [1.0.1] - 2024-01-21

### Fixed

- **Test Suite Corrections:**
  - Fixed all automated test failures (59/59 tests now passing)
  - Updated test credentials to use "password123" consistently
  - Corrected book creation/update tests to use `author_ids` and `category_ids` instead of `authors` and `categories`
  - Fixed book update test to expect correct response structure (message instead of data.title)
  - Fixed authentication route test to use `/api/auth/me` instead of `/api/auth/profile`
  - Corrected email addresses in test data to match seed data

- **Backend Improvements:**
  - Fixed bcrypt password hash in seed data (all users now use same hash for "password123")
  - Modified `server.js` to skip server startup during tests (NODE_ENV=test check)
  - Enhanced `authController.register` to return both token and user object (matching login response)
  - Fixed `booksController.updateBook` to properly handle undefined values (convert to null for SQL)
  - Added Jest setup file to set NODE_ENV=test globally

- **Test Coverage:**
  - Final coverage: 62.51% overall code coverage
  - All 5 test suites passing (auth, books, loans, reservations, reports)
  - 59 tests total covering all major API endpoints

## [1.0.0] - 2024-01-20

### Added - Complete Initial Implementation

#### Project Infrastructure

- Complete project structure with organized directories
- Package.json with all dependencies (Express, MySQL2, bcrypt, JWT, etc.)
- Environment configuration with `.env.example` template
- Git ignore configuration
- Jest configuration for automated testing

#### Database

- **Schema (`db/schema.sql`):**
  - 8 normalized tables: users, books, authors, categories, loans, reservations, book_authors, book_categories
  - 3 database views: available_books, overdue_loans, active_reservations
  - 3 stored procedures: sp_borrow_book, sp_return_book, sp_most_borrowed_books
  - 1 trigger: update_book_availability (maintains book availability on loan changes)
  - Proper indexing and foreign key constraints

- **Seed Data (`db/seed.sql`):**
  - 25 books across multiple genres
  - 20 authors and 15 categories
  - 11 sample users (1 admin, 2 librarians, 8 members)
  - Sample loans and reservations for testing

#### Backend API

- **Configuration:**
  - Database connection pooling with MySQL2
  - Centralized app configuration
  - Environment variable management

- **Authentication & Authorization:**
  - JWT-based authentication system
  - bcrypt password hashing with salt rounds
  - Role-based middleware (member, librarian, admin)
  - Protected route handling

- **Validation:**
  - express-validator integration
  - Request validation for all endpoints
  - Custom validation rules for registration, login, books, loans, reservations

- **Error Handling:**
  - Global error handler middleware
  - 404 not found handler
  - Async error wrapper
  - Standardized error responses

- **Controllers:**
  - authController: Registration, login, profile
  - booksController: CRUD operations with pagination and search
  - loansController: Borrow, return with stored procedures
  - reservationsController: Create, cancel, queue management
  - catalogController: Authors and categories management
  - reportsController: Statistics, most borrowed, overdue, member activity
  - usersController: User management (admin only)

- **Routes:**
  - `/api/auth` - Authentication endpoints
  - `/api/books` - Book catalog management
  - `/api/loans` - Borrowing system
  - `/api/reservations` - Reservation system
  - `/api/catalog` - Authors and categories
  - `/api/reports` - Analytics and reports
  - `/api/users` - User management

#### Frontend

- **HTML Pages:**
  - index.html: Home page with hero section and features
  - login.html: User authentication
  - register.html: New user registration
  - catalog.html: Book browsing with search and filters
  - dashboard.html: User loans, reservations, and profile
  - admin.html: Administrative panel

- **CSS (`frontend/css/main.css`):**
  - 700+ lines of responsive styling
  - Mobile-first design approach
  - CSS variables for theming
  - Responsive navigation with hamburger menu
  - Card layouts, tables, modals, forms
  - Breakpoints: 480px, 768px, 1024px

- **JavaScript:**
  - main.js: Common utilities, API helpers, authentication checks
  - auth.js: Login and registration form handlers
  - catalog.js: Book browsing, search, filtering, borrowing, reserving
  - dashboard.js: User loans/reservations management
  - admin.js: Admin panel functionality (statistics, management, reports)

#### Testing

- **Automated Tests (Jest + Supertest):**
  - auth.test.js: 10+ authentication tests
  - books.test.js: 15+ book management tests
  - loans.test.js: 12+ borrowing system tests
  - reservations.test.js: 10+ reservation tests
  - reports.test.js: 12+ report and analytics tests
  - Total: 60+ test cases

- **Test Configuration:**
  - Jest setup with node environment
  - Coverage reporting (text, lcov, html)
  - 10-second timeout for database operations

#### Documentation

- **API Documentation (`docs/api.md`):**
  - Complete endpoint reference
  - Request/response examples
  - Error response documentation
  - Authentication instructions

- **Setup Guide (`docs/setup.md`):**
  - Prerequisites and installation steps
  - Database setup instructions
  - Environment configuration
  - Running and testing procedures
  - Troubleshooting guide
  - Deployment instructions

- **Testing Guide (`docs/tests.md`):**
  - Automated test procedures
  - Manual test cases (10+ detailed scenarios)
  - Edge case testing
  - Performance testing
  - Browser compatibility
  - Security testing

- **Project Documentation:**
  - Problem statement with objectives
  - ERD diagram (Mermaid)
  - Use case diagrams (Mermaid)

### Features

#### For All Users

- Browse book catalog without authentication
- Search books by title, author, or ISBN
- Filter by category, author, or availability
- Pagination support (configurable page size)
- Responsive design for all devices

#### For Members

- User registration and login
- View personal profile
- Borrow available books
- Return borrowed books
- View borrowing history
- Check fine amounts for overdue books
- Reserve unavailable books
- Cancel reservations
- View queue position for reservations

#### For Librarians

- All member features
- Add new books to catalog
- Edit book information
- Manage authors and categories
- View all system loans
- View all reservations
- Access reports and statistics

#### For Administrators

- All librarian features
- Delete books from catalog
- View all users
- Delete user accounts
- Comprehensive analytics dashboard
- Full system statistics

### Security

- JWT token-based authentication
- Bcrypt password hashing
- Role-based access control
- Input validation and sanitization
- SQL injection prevention with parameterized queries
- XSS protection
- CORS configuration
- Environment variable protection

### Technical Highlights

- RESTful API architecture
- Transaction-safe database operations
- Stored procedures for complex business logic
- Database triggers for automatic updates
- Promise-based database queries
- Error handling with custom error classes
- API response standardization
- Mobile-first responsive design

### Dependencies

- express ^4.18.2
- pg ^8.11.3
- bcrypt ^5.1.1
- jsonwebtoken ^9.0.2
- dotenv ^16.3.1
- cors ^2.8.5
- express-validator ^7.0.1
- nodemon ^3.0.2 (dev)
- jest ^29.7.0 (dev)
- supertest ^6.3.3 (dev)

---

## Version History

### [1.0.0] - 2024-01-20

- Initial complete implementation
- All core features functional
- Comprehensive testing suite
- Full documentation

---

## Future Enhancements (Potential)

- Email notifications for due dates and reservations
- Advanced reporting with charts and graphs
- Export reports to PDF/CSV
- Barcode scanning for books
- Multi-language support
- Mobile app version
- Integration with external library databases
- Payment gateway for fines
- Book recommendations based on borrowing history
