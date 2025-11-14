# Setup and Deployment Guide

Complete guide to set up and run the Library Management System.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8 or higher) - [Download](https://dev.mysql.com/downloads/)
- **Git** (optional) - [Download](https://git-scm.com/)

---

## Installation Steps

### 1. Clone or Download the Project

If using Git:

```bash
git clone <repository-url>
cd web
```

Or download and extract the ZIP file, then navigate to the project directory.

---

### 2. Install Dependencies

```bash
npm install
```

This will install all required Node.js packages including:

- Express.js (backend framework)
- MySQL2 (database driver)
- bcrypt (password hashing)
- jsonwebtoken (JWT authentication)
- And all other dependencies

---

### 3. Database Setup

#### A. Create MySQL Database

Open MySQL command line or MySQL Workbench and run:

```sql
CREATE DATABASE library_db;
```

#### B. Create Database User (Optional but Recommended)

```sql
CREATE USER 'library_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON library_db.* TO 'library_user'@'localhost';
FLUSH PRIVILEGES;
```

#### C. Run Schema SQL

Navigate to the project directory and run:

```bash
mysql -u library_user -p library_db < db/schema.sql
```

Or execute `db/schema.sql` in MySQL Workbench.

This creates:

- 8 tables (users, books, authors, categories, loans, reservations, etc.)
- 3 views (available_books, overdue_loans, active_reservations)
- 3 stored procedures (sp_borrow_book, sp_return_book, sp_most_borrowed_books)
- 1 trigger (update_book_availability)

#### D. Seed Sample Data (Optional)

To populate the database with sample data:

```bash
mysql -u library_user -p library_db < db/seed.sql
```

This adds:

- 25 books across multiple categories
- 11 users (admin, librarians, members)
- Sample loans and reservations

---

### 4. Environment Configuration

Create a `.env` file in the project root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=library_user
DB_PASSWORD=your_secure_password
DB_NAME=library_db

# JWT Configuration
JWT_SECRET=your_very_long_random_secret_key_here_min_32_characters
JWT_EXPIRE=7d

# Fine Configuration
FINE_PER_DAY=0.50
```

**Important:** Generate a strong JWT_SECRET:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Running the Application

### Development Mode (with auto-restart)

```bash
npm run dev
```

The server will start on `http://localhost:3000` and automatically restart on file changes.

### Production Mode

```bash
npm start
```

---

## Testing the Application

### Run Automated Tests

```bash
npm test
```

This runs the Jest test suite covering:

- Authentication endpoints
- Book CRUD operations
- Loan management
- Reservation system
- Reports and statistics

### Generate Test Coverage Report

```bash
npm test -- --coverage
```

Coverage report will be generated in the `coverage/` directory.

---

## Accessing the Application

### Frontend URLs

- **Home Page:** <http://localhost:3000/>
- **Login:** <http://localhost:3000/login.html>
- **Register:** <http://localhost:3000/register.html>
- **Catalog:** <http://localhost:3000/catalog.html>
- **Dashboard:** <http://localhost:3000/dashboard.html> (requires login)
- **Admin Panel:** <http://localhost:3000/admin.html> (requires admin/librarian role)

### Default User Accounts

After running `db/seed.sql`, you can login with these accounts:

**Admin Account:**

- Email: `admin@library.com`
- Password: `Admin123!@#`

**Librarian Account:**

- Email: `sarah.johnson@library.com`
- Password: `Password123!@#`

**Member Account:**

- Email: `john.doe@email.com`
- Password: `Password123!@#`

---

## API Testing with Postman/cURL

### Example: Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!",
    "name": "New User",
    "phone": "1234567890"
  }'
```

### Example: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@library.com",
    "password": "Admin123!@#"
  }'
```

### Example: Get Books (Authenticated)

```bash
curl -X GET http://localhost:3000/api/books \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

See `docs/api.md` for complete API documentation.

---

## Project Structure

```
web/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and app configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── routes/          # API route definitions
│   │   └── server.js        # Main application entry point
│   └── tests/               # Automated test suites
├── db/
│   ├── schema.sql           # Database schema
│   └── seed.sql             # Sample data
├── docs/                    # Documentation
├── frontend/
│   ├── css/                 # Stylesheets
│   ├── js/                  # Client-side JavaScript
│   └── *.html               # HTML pages
├── .env.example             # Environment template
├── .gitignore
├── package.json
└── README.md
```

---

## Troubleshooting

### MySQL Connection Issues

**Error:** "Access denied for user"

- Verify username and password in `.env`
- Check MySQL user privileges: `SHOW GRANTS FOR 'library_user'@'localhost';`

**Error:** "Cannot connect to MySQL server"

- Ensure MySQL is running: `mysql --version`
- Check DB_HOST and DB_PORT in `.env`

### Port Already in Use

**Error:** "Port 3000 is already in use"

Change the PORT in `.env`:

```env
PORT=3001
```

### JWT Token Issues

**Error:** "Invalid token"

- Ensure JWT_SECRET matches between registration and login
- Check token expiration (default: 7 days)

### Database Schema Errors

**Error:** "Table doesn't exist"

- Re-run `db/schema.sql` to recreate tables
- Check database name: `USE library_db;`

---

## Deployment to Production

### 1. Update Environment

Create production `.env`:

```env
NODE_ENV=production
PORT=80
DB_HOST=your_production_db_host
JWT_SECRET=your_production_secret
```

### 2. Build for Production

```bash
npm install --production
```

### 3. Use Process Manager (PM2)

Install PM2:

```bash
npm install -g pm2
```

Start application:

```bash
pm2 start backend/src/server.js --name library-app
pm2 startup
pm2 save
```

Monitor:

```bash
pm2 status
pm2 logs library-app
```

### 4. Configure Nginx (Optional)

For production deployment with reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Security Considerations

1. **Never commit `.env` file** - Contains sensitive credentials
2. **Use strong JWT_SECRET** - Minimum 32 characters
3. **Enable HTTPS in production** - Use SSL certificates
4. **Sanitize user inputs** - Already implemented with express-validator
5. **Keep dependencies updated** - Run `npm audit` regularly
6. **Use environment variables** - Never hardcode credentials

---

## Support

For issues or questions:

1. Check this documentation
2. Review `docs/api.md` for API details
3. Check `docs/tests.md` for testing procedures
4. Review error logs in console

---

## License

This project is created for educational purposes as a university project.
