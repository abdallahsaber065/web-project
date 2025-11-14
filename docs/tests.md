# Testing Documentation

Comprehensive testing guide for the Library Management System.

## Automated Tests

### Running Tests

Execute all automated tests:

```bash
npm test
```

Run specific test file:

```bash
npm test -- auth.test.js
```

Run with coverage report:

```bash
npm test -- --coverage
```

Watch mode (re-run on changes):

```bash
npm test -- --watch
```

---

## Test Suites Overview

### 1. Authentication Tests (`auth.test.js`)

Tests all authentication-related functionality.

**Test Cases:**

✅ **User Registration**

- Should register new user successfully
- Should fail with duplicate email
- Should fail with invalid email format
- Should fail with weak password

✅ **User Login**

- Should login with correct credentials
- Should fail with incorrect password
- Should fail with non-existent user

✅ **User Profile**

- Should get profile with valid token
- Should fail without authentication
- Should fail with invalid token

**How to Run:**

```bash
npm test -- auth.test.js
```

---

### 2. Books Tests (`books.test.js`)

Tests book catalog and CRUD operations.

**Test Cases:**

✅ **Get All Books**

- Should retrieve books without authentication
- Should filter books by category
- Should search books by title
- Should paginate results correctly

✅ **Get Book by ID**

- Should get book details
- Should return 404 for non-existent book

✅ **Create Book**

- Should create book as librarian
- Should fail without authentication
- Should fail as member role

✅ **Update Book**

- Should update book as librarian
- Should fail without authentication

✅ **Delete Book**

- Should fail as librarian (admin only)
- Should delete book as admin
- Should return 404 after deletion

**How to Run:**

```bash
npm test -- books.test.js
```

---

### 3. Loans Tests (`loans.test.js`)

Tests borrowing and returning functionality.

**Test Cases:**

✅ **Borrow Book**

- Should borrow available book
- Should fail without authentication
- Should fail with non-existent book

✅ **Get My Loans**

- Should retrieve user's loans
- Should filter by status
- Should fail without authentication

✅ **Get All Loans (Admin)**

- Should get all loans as admin
- Should fail as member

✅ **Return Book**

- Should return book successfully
- Should calculate fines correctly
- Should fail for non-existent loan

**How to Run:**

```bash
npm test -- loans.test.js
```

---

### 4. Reservations Tests (`reservations.test.js`)

Tests book reservation system.

**Test Cases:**

✅ **Create Reservation**

- Should reserve book successfully
- Should fail without authentication
- Should fail with non-existent book

✅ **Get My Reservations**

- Should retrieve user's reservations
- Should include queue position
- Should fail without authentication

✅ **Get All Reservations (Admin)**

- Should get all reservations as admin
- Should fail as member

✅ **Cancel Reservation**

- Should cancel successfully
- Should fail for non-existent reservation

**How to Run:**

```bash
npm test -- reservations.test.js
```

---

### 5. Reports Tests (`reports.test.js`)

Tests administrative reports and analytics.

**Test Cases:**

✅ **Most Borrowed Books**

- Should retrieve most borrowed books
- Should respect limit parameter
- Should fail without authentication
- Should fail as member

✅ **Overdue Loans**

- Should get overdue loans
- Should calculate days overdue
- Should fail without authentication

✅ **Member Activity**

- Should get member statistics
- Should fail as member

✅ **Library Statistics**

- Should get comprehensive statistics
- Should have correct data structure

✅ **Loans by Date**

- Should filter by date range
- Should fail without date parameters
- Should fail as member

**How to Run:**

```bash
npm test -- reports.test.js
```

---

## Manual Testing Procedures

### Prerequisites for Manual Testing

1. Ensure database is set up with seed data:

```bash
mysql -u library_user -p library_db < db/seed.sql
```

2. Start the server:

```bash
npm run dev
```

3. Access frontend at <http://localhost:3000>

---

### Manual Test Cases

#### Test 1: User Registration and Login

**Steps:**

1. Navigate to <http://localhost:3000/register.html>
2. Fill in registration form:
   - Email: <test@example.com>
   - Password: Test123!@#
   - Name: Test User
   - Phone: 1234567890
3. Click "Register"
4. Verify redirect to catalog page
5. Check navigation shows user name
6. Logout
7. Navigate to login page
8. Login with same credentials
9. Verify successful login

**Expected Results:**

- Registration creates new account
- JWT token stored in localStorage
- Navigation updates with user info
- Login works with created credentials

---

#### Test 2: Browse and Search Books

**Steps:**

1. Navigate to catalog page (login not required)
2. View initial book listing
3. Use search box: enter "Pride"
4. Select category from dropdown
5. Test pagination (next/previous)
6. Click on a book card to view details

**Expected Results:**

- Books display with correct information
- Search filters results correctly
- Category filter works
- Pagination navigates properly
- Modal shows full book details

---

#### Test 3: Borrow a Book

**Steps:**

1. Login as member (<john.doe@email.com> / Password123!@#)
2. Navigate to catalog
3. Find an available book
4. Click "Borrow" button
5. Confirm borrowing
6. Navigate to dashboard
7. Check "Active Loans" tab

**Expected Results:**

- Borrow button only appears for available books
- Success message after borrowing
- Book appears in active loans
- Available copies decremented by 1
- Due date is 14 days from today

---

#### Test 4: Return a Book

**Steps:**

1. From dashboard, go to "Active Loans"
2. Find a borrowed book
3. Click "Return" button
4. Check for fine amount (if overdue)
5. Confirm return
6. Refresh page

**Expected Results:**

- Return successful
- Fine calculated if overdue ($0.50/day)
- Loan moved to "Past Loans" tab
- Book available copies increased

---

#### Test 5: Reserve a Book

**Steps:**

1. Login as member
2. Navigate to catalog
3. Find a book with 0 available copies
4. Click "Reserve" button
5. Navigate to dashboard
6. Check "Reservations" tab

**Expected Results:**

- Reserve button appears only when unavailable
- Reservation created successfully
- Queue position shown
- Reservation appears in dashboard

---

#### Test 6: Admin Panel - Statistics

**Steps:**

1. Login as admin (<admin@library.com> / Admin123!@#)
2. Navigate to admin panel
3. View Statistics tab
4. Verify all statistics display

**Expected Results:**

- All statistics display correctly:
  - Unique titles count
  - Total/available copies
  - Active/overdue loans
  - Active reservations
  - Total members
  - Outstanding fines

---

#### Test 7: Admin Panel - Book Management

**Steps:**

1. Login as admin
2. Navigate to admin panel
3. Go to "Books" tab
4. View all books table
5. Click "Edit" on a book (would need implementation)
6. Click "Delete" on a test book
7. Confirm deletion

**Expected Results:**

- All books listed in table
- Edit functionality available
- Delete removes book
- Confirmation before deletion

---

#### Test 8: Admin Panel - View Loans

**Steps:**

1. Login as librarian or admin
2. Navigate to admin panel
3. Go to "Loans" tab
4. Filter by "active" status
5. Filter by "overdue" status
6. View all loans

**Expected Results:**

- All system loans visible
- Status filter works correctly
- User and book information displayed
- Fine amounts shown

---

#### Test 9: Reports - Most Borrowed

**Steps:**

1. Login as admin
2. Navigate to admin panel
3. Go to "Reports" tab
4. Click "Most Borrowed Books"
5. View results

**Expected Results:**

- Top 10 most borrowed books displayed
- Borrow count shown
- Authors listed
- Sorted by count descending

---

#### Test 10: Reports - Overdue Loans

**Steps:**

1. Login as admin
2. Go to Reports tab
3. Click "Overdue Loans"
4. Review overdue items

**Expected Results:**

- Only overdue loans shown
- Days overdue calculated
- Fines calculated correctly ($0.50/day)
- User and book information visible

---

## Edge Cases and Error Handling

### Test Case: Duplicate Email Registration

**Steps:**

1. Try to register with existing email
2. Verify error message

**Expected:** "Email already exists" error

---

### Test Case: Invalid Login Credentials

**Steps:**

1. Try to login with wrong password
2. Try to login with non-existent email

**Expected:** "Invalid credentials" error for both

---

### Test Case: Unauthorized Access

**Steps:**

1. Logout completely
2. Try to access /dashboard.html
3. Try to access /admin.html

**Expected:** Redirect to login page

---

### Test Case: Role-Based Access Control

**Steps:**

1. Login as regular member
2. Try to access admin panel

**Expected:** "Access denied" and redirect

---

### Test Case: Borrow Unavailable Book

**Steps:**

1. Try to borrow book with 0 available copies

**Expected:** Error message, suggestion to reserve

---

### Test Case: Maximum Active Loans

**Steps:**

1. Borrow 5 books (max limit)
2. Try to borrow 6th book

**Expected:** Error about maximum active loans

---

### Test Case: Return Already Returned Book

**Steps:**

1. Return a book
2. Try to return same loan again

**Expected:** Error about invalid loan status

---

### Test Case: Cancel Non-Existent Reservation

**Steps:**

1. Try to cancel reservation that doesn't exist

**Expected:** 404 error or "Reservation not found"

---

## Performance Testing

### Load Testing with Apache Bench

Test API endpoint performance:

```bash
# Test login endpoint
ab -n 1000 -c 10 -p login.json -T application/json \
  http://localhost:3000/api/auth/login

# Test books listing
ab -n 1000 -c 10 \
  http://localhost:3000/api/books
```

**Expected Performance:**

- Response time < 200ms for simple queries
- Response time < 500ms for complex queries
- Server handles 100+ concurrent requests

---

## Database Testing

### Test Data Integrity

**Verify Trigger Functionality:**

```sql
-- Check that book availability updates after loan
SELECT id, title, available_copies FROM books WHERE id = 1;
-- Borrow the book
-- Check again
SELECT id, title, available_copies FROM books WHERE id = 1;
-- available_copies should decrease by 1
```

**Verify Stored Procedure:**

```sql
-- Test borrow procedure
CALL sp_borrow_book(1, 3);
-- Should create loan and update book availability
```

**Verify Views:**

```sql
-- Check available books view
SELECT * FROM available_books;

-- Check overdue loans view
SELECT * FROM overdue_loans;
```

---

## Browser Compatibility Testing

Test the frontend in multiple browsers:

- ✅ Google Chrome (latest)
- ✅ Mozilla Firefox (latest)
- ✅ Microsoft Edge (latest)
- ✅ Safari (latest)

**Test Checklist for Each Browser:**

- Navigation works
- Forms submit correctly
- Modals open/close
- Responsive design on mobile
- JavaScript functions properly

---

## Accessibility Testing

**Checklist:**

- ✅ All forms have proper labels
- ✅ Images have alt text
- ✅ Keyboard navigation works
- ✅ Color contrast meets WCAG standards
- ✅ Error messages are clear and accessible

---

## Security Testing

### Authentication Security

**Test:**

- ✅ Passwords are hashed (bcrypt)
- ✅ JWT tokens expire correctly
- ✅ Invalid tokens rejected
- ✅ SQL injection prevented (parameterized queries)
- ✅ XSS prevented (input sanitization)

---

## Test Coverage Goals

Minimum coverage targets:

- **Overall:** 80%
- **Controllers:** 85%
- **Routes:** 90%
- **Middleware:** 95%

Check current coverage:

```bash
npm test -- --coverage
```

---

## Continuous Integration (Optional)

For automated testing on commit, add to `.github/workflows/test.yml`:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
```

---

## Reporting Bugs

When reporting issues, include:

1. Steps to reproduce
2. Expected vs actual behavior
3. Screenshots (if UI issue)
4. Error messages from console
5. Browser/environment details
