# API Documentation

Complete documentation for all Library Management System API endpoints.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "phone": "1234567890"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "member"
    }
  }
}
```

---

### Login

**POST** `/auth/login`

Authenticate and receive JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "member"
    }
  }
}
```

---

### Get Profile

**GET** `/auth/profile`

Get authenticated user's profile.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "1234567890",
    "role": "member"
  }
}
```

---

## Books Endpoints

### Get All Books

**GET** `/books`

Retrieve books with optional filtering, searching, and pagination.

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `search` (string): Search by title, author, or ISBN
- `category` (number): Filter by category ID
- `author` (number): Filter by author ID
- `available` (boolean): Filter by availability

**Example:**

```
GET /books?search=pride&category=1&page=1&limit=10
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "books": [
      {
        "id": 1,
        "title": "Pride and Prejudice",
        "isbn": "9780141439518",
        "publisher": "Penguin Classics",
        "publication_year": 1813,
        "description": "A romantic novel...",
        "total_copies": 5,
        "available_copies": 3,
        "authors": "Jane Austen",
        "categories": "Fiction, Romance"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "limit": 10
    }
  }
}
```

---

### Get Book by ID

**GET** `/books/:id`

Get detailed information about a specific book.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Pride and Prejudice",
    "isbn": "9780141439518",
    "publisher": "Penguin Classics",
    "publication_year": 1813,
    "description": "A romantic novel...",
    "total_copies": 5,
    "available_copies": 3,
    "authors": "Jane Austen",
    "categories": "Fiction, Romance"
  }
}
```

---

### Create Book

**POST** `/books`

Create a new book (Librarian/Admin only).

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "title": "New Book Title",
  "isbn": "9781234567890",
  "publisher": "Publisher Name",
  "publication_year": 2024,
  "total_copies": 3,
  "description": "Book description",
  "authors": [1, 2],
  "categories": [1]
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": 26,
    "message": "Book created successfully"
  }
}
```

---

### Update Book

**PUT** `/books/:id`

Update book information (Librarian/Admin only).

**Request Body:**

```json
{
  "title": "Updated Title",
  "total_copies": 5,
  "authors": [1],
  "categories": [1, 2]
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 26,
    "title": "Updated Title",
    "total_copies": 5
  }
}
```

---

### Delete Book

**DELETE** `/books/:id`

Delete a book (Admin only).

**Response (200):**

```json
{
  "success": true,
  "message": "Book deleted successfully"
}
```

---

## Loans Endpoints

### Borrow Book

**POST** `/loans/borrow`

Borrow a book using stored procedure.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "book_id": 1
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "loan_id": 15,
    "due_date": "2024-02-01",
    "message": "Book borrowed successfully"
  }
}
```

---

### Return Book

**POST** `/loans/:id/return`

Return a borrowed book with automatic fine calculation.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "return_date": "2024-01-28",
    "fine_amount": 0.00,
    "message": "Book returned successfully"
  }
}
```

---

### Get My Loans

**GET** `/loans/my-loans`

Get authenticated user's loans.

**Query Parameters:**

- `status` (string): Filter by status (active, returned, overdue)

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "book_id": 5,
      "book_title": "1984",
      "borrow_date": "2024-01-15",
      "due_date": "2024-02-01",
      "return_date": null,
      "status": "active",
      "fine_amount": 0.00
    }
  ]
}
```

---

### Get All Loans (Admin)

**GET** `/loans`

Get all loans (Librarian/Admin only).

**Query Parameters:**

- `status` (string): Filter by status

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 3,
      "user_name": "John Doe",
      "book_id": 5,
      "book_title": "1984",
      "borrow_date": "2024-01-15",
      "due_date": "2024-02-01",
      "status": "active",
      "fine_amount": 0.00
    }
  ]
}
```

---

## Reservations Endpoints

### Create Reservation

**POST** `/reservations`

Reserve a book.

**Request Body:**

```json
{
  "book_id": 1
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "reservation_id": 5,
    "queue_position": 2,
    "message": "Book reserved successfully"
  }
}
```

---

### Get My Reservations

**GET** `/reservations/my-reservations`

Get user's active reservations with queue positions.

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "book_id": 1,
      "book_title": "Pride and Prejudice",
      "reservation_date": "2024-01-20",
      "status": "active",
      "queue_position": 2
    }
  ]
}
```

---

### Cancel Reservation

**DELETE** `/reservations/:id`

Cancel a reservation.

**Response (200):**

```json
{
  "success": true,
  "message": "Reservation cancelled successfully"
}
```

---

## Catalog Endpoints

### Authors

**GET** `/catalog/authors` - Get all authors  
**GET** `/catalog/authors/:id` - Get author by ID  
**POST** `/catalog/authors` - Create author (Librarian/Admin)  
**PUT** `/catalog/authors/:id` - Update author (Librarian/Admin)  
**DELETE** `/catalog/authors/:id` - Delete author (Admin)

### Categories

**GET** `/catalog/categories` - Get all categories  
**GET** `/catalog/categories/:id` - Get category by ID  
**POST** `/catalog/categories` - Create category (Librarian/Admin)  
**PUT** `/catalog/categories/:id` - Update category (Librarian/Admin)  
**DELETE** `/catalog/categories/:id` - Delete category (Admin)

---

## Reports Endpoints (Admin/Librarian)

### Most Borrowed Books

**GET** `/reports/most-borrowed`

**Query Parameters:**

- `limit` (number): Number of results (default: 10)

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "title": "1984",
      "authors": "George Orwell",
      "borrow_count": 15
    }
  ]
}
```

---

### Overdue Loans

**GET** `/reports/overdue`

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "loan_id": 3,
      "user_name": "John Doe",
      "book_title": "To Kill a Mockingbird",
      "due_date": "2024-01-10",
      "days_overdue": 10,
      "calculated_fine": 5.00
    }
  ]
}
```

---

### Member Activity

**GET** `/reports/member-activity`

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "user_id": 3,
      "name": "John Doe",
      "total_loans": 25,
      "active_loans": 3,
      "overdue_loans": 1,
      "total_fines": 5.00
    }
  ]
}
```

---

### Statistics

**GET** `/reports/statistics`

Get comprehensive library statistics.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "books": {
      "unique_titles": 25,
      "total_copies": 125,
      "available_copies": 87
    },
    "loans": {
      "active": 38,
      "overdue": 5
    },
    "reservations": {
      "active": 12
    },
    "members": {
      "total": 50
    },
    "fines": {
      "outstanding": 125.50
    }
  }
}
```

---

### Loans by Date

**GET** `/reports/loans-by-date`

**Query Parameters:**

- `start_date` (date): Start date (required)
- `end_date` (date): End date (required)

**Example:**

```
GET /reports/loans-by-date?start_date=2024-01-01&end_date=2024-01-31
```

---

## Users Endpoints (Admin)

### Get All Users

**GET** `/users`

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "1234567890",
      "role": "member"
    }
  ]
}
```

---

### Delete User

**DELETE** `/users/:id`

**Response (200):**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Error Responses

All endpoints may return these error responses:

**400 Bad Request:**

```json
{
  "success": false,
  "message": "Validation error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**401 Unauthorized:**

```json
{
  "success": false,
  "message": "Authentication required"
}
```

**403 Forbidden:**

```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

**404 Not Found:**

```json
{
  "success": false,
  "message": "Resource not found"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "message": "Internal server error"
}
```
