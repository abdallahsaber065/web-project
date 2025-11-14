# Library Management System

A comprehensive web-based library management system built with Node.js, Express, MySQL, and vanilla JavaScript.

## Features

- **Member Management**: Registration, authentication, and role-based access control
- **Book Catalog**: Search, filter, and browse books with pagination
- **Borrowing System**: Borrow and return books with due date tracking
- **Fine Calculation**: Automatic calculation of fines for overdue books
- **Reservation System**: Reserve books that are currently unavailable
- **Admin Panel**: Manage books, members, and view reports
- **Reports**: Most borrowed books, member activity, overdue loans

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt

## Project Structure

```
library-management-system/
├── backend/
│   ├── src/
│   │   ├── config/         # Database and app configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth and validation middleware
│   │   ├── routes/         # API routes
│   │   └── server.js       # Application entry point
│   └── tests/              # API tests
├── frontend/
│   ├── css/                # Stylesheets
│   ├── js/                 # Client-side JavaScript
│   ├── assets/             # Images and other assets
│   └── *.html              # HTML pages
├── db/
│   ├── schema.sql          # Database schema
│   └── seed.sql            # Sample data
└── docs/                   # Documentation
```

## Setup Instructions

See [docs/setup.md](docs/setup.md) for detailed installation and setup instructions.

## API Documentation

See [docs/api.md](docs/api.md) for complete API reference.

## License

MIT
