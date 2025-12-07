-- Library Management System Database Schema
-- PostgreSQL Database Schema

-- Drop existing database objects if they exist
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Grant privileges
GRANT ALL ON SCHEMA public TO public;

-- =====================================================
-- CUSTOM TYPES
-- =====================================================
CREATE TYPE user_role AS ENUM ('member', 'librarian', 'admin');
CREATE TYPE loan_status AS ENUM ('borrowed', 'returned', 'overdue');
CREATE TYPE reservation_status AS ENUM ('active', 'cancelled', 'fulfilled');

-- =====================================================
-- TABLE: users
-- Stores all system users (members, librarians, admins)
-- =====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'member' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- TABLE: authors
-- Stores author information
-- =====================================================
CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    biography TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_authors_name ON authors(name);

-- =====================================================
-- TABLE: categories
-- Book categories/genres
-- =====================================================
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: books
-- Main book catalog
-- =====================================================
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    isbn VARCHAR(13) UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    publisher VARCHAR(255),
    publication_year SMALLINT,
    total_copies INTEGER NOT NULL DEFAULT 1 CHECK (total_copies >= 0),
    available_copies INTEGER NOT NULL DEFAULT 1 CHECK (available_copies >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_available_copies CHECK (available_copies <= total_copies)
);

CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_isbn ON books(isbn);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: book_authors
-- Many-to-many relationship between books and authors
-- =====================================================
CREATE TABLE book_authors (
    book_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    PRIMARY KEY (book_id, author_id),
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
);

CREATE INDEX idx_book_authors_book_id ON book_authors(book_id);
CREATE INDEX idx_book_authors_author_id ON book_authors(author_id);

-- =====================================================
-- TABLE: book_categories
-- Many-to-many relationship between books and categories
-- =====================================================
CREATE TABLE book_categories (
    book_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (book_id, category_id),
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX idx_book_categories_book_id ON book_categories(book_id);
CREATE INDEX idx_book_categories_category_id ON book_categories(category_id);

-- =====================================================
-- TABLE: loans
-- Tracks book borrowing transactions
-- =====================================================
CREATE TABLE loans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    fine_amount DECIMAL(10, 2) DEFAULT 0.00 CHECK (fine_amount >= 0),
    status loan_status DEFAULT 'borrowed' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE RESTRICT,
    CONSTRAINT chk_due_date CHECK (due_date >= borrow_date)
);

CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_loans_book_id ON loans(book_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_due_date ON loans(due_date);

-- Trigger to auto-update loans updated_at
CREATE TRIGGER update_loans_updated_at
    BEFORE UPDATE ON loans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: reservations
-- Manages book reservations
-- =====================================================
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status reservation_status DEFAULT 'active' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_book_id ON reservations(book_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_reserved_at ON reservations(reserved_at);

-- Trigger to auto-update reservations updated_at
CREATE TRIGGER update_reservations_updated_at
    BEFORE UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS for common queries
-- =====================================================

-- View: Books with author and category information
CREATE VIEW v_books_complete AS
SELECT 
    b.id,
    b.isbn,
    b.title,
    b.description,
    b.publisher,
    b.publication_year,
    b.total_copies,
    b.available_copies,
    STRING_AGG(DISTINCT a.name, ', ' ORDER BY a.name) AS authors,
    STRING_AGG(DISTINCT c.name, ', ' ORDER BY c.name) AS categories
FROM books b
LEFT JOIN book_authors ba ON b.id = ba.book_id
LEFT JOIN authors a ON ba.author_id = a.id
LEFT JOIN book_categories bc ON b.id = bc.book_id
LEFT JOIN categories c ON bc.category_id = c.id
GROUP BY b.id;

-- View: Active loans with user and book details
CREATE VIEW v_active_loans AS
SELECT 
    l.id,
    l.user_id,
    u.name AS user_name,
    u.email AS user_email,
    l.book_id,
    b.title AS book_title,
    b.isbn,
    l.borrow_date,
    l.due_date,
    l.status,
    l.fine_amount,
    CURRENT_DATE - l.due_date AS days_overdue
FROM loans l
JOIN users u ON l.user_id = u.id
JOIN books b ON l.book_id = b.id
WHERE l.return_date IS NULL;

-- View: Reservation queue with position
CREATE VIEW v_reservation_queue AS
SELECT 
    r.id,
    r.user_id,
    u.name AS user_name,
    u.email AS user_email,
    r.book_id,
    b.title AS book_title,
    r.reserved_at,
    r.status,
    ROW_NUMBER() OVER (PARTITION BY r.book_id ORDER BY r.reserved_at) AS queue_position
FROM reservations r
JOIN users u ON r.user_id = u.id
JOIN books b ON r.book_id = b.id
WHERE r.status = 'active';

-- =====================================================
-- STORED FUNCTIONS (PostgreSQL uses functions instead of procedures)
-- =====================================================

-- Function: Borrow a book
CREATE OR REPLACE FUNCTION sp_borrow_book(
    p_user_id INTEGER,
    p_book_id INTEGER,
    p_loan_duration_days INTEGER
)
RETURNS TABLE(loan_id INTEGER) AS $$
DECLARE
    v_available_copies INTEGER;
    v_user_active_loans INTEGER;
    v_max_loans INTEGER := 5;
    v_loan_id INTEGER;
BEGIN
    -- Check available copies
    SELECT available_copies INTO v_available_copies
    FROM books WHERE id = p_book_id;
    
    IF v_available_copies IS NULL THEN
        RAISE EXCEPTION 'Book not found';
    END IF;
    
    IF v_available_copies <= 0 THEN
        RAISE EXCEPTION 'No available copies of this book';
    END IF;
    
    -- Check user's current active loans
    SELECT COUNT(*) INTO v_user_active_loans
    FROM loans 
    WHERE user_id = p_user_id AND return_date IS NULL;
    
    IF v_user_active_loans >= v_max_loans THEN
        RAISE EXCEPTION 'User has reached maximum loan limit';
    END IF;
    
    -- Create loan record
    INSERT INTO loans (user_id, book_id, borrow_date, due_date)
    VALUES (p_user_id, p_book_id, CURRENT_DATE, CURRENT_DATE + p_loan_duration_days)
    RETURNING id INTO v_loan_id;
    
    -- Decrement available copies
    UPDATE books 
    SET available_copies = available_copies - 1 
    WHERE id = p_book_id;
    
    RETURN QUERY SELECT v_loan_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Return a book
CREATE OR REPLACE FUNCTION sp_return_book(
    p_loan_id INTEGER,
    p_fine_per_day DECIMAL(10,2)
)
RETURNS TABLE(fine_amount DECIMAL(10,2), days_late INTEGER) AS $$
DECLARE
    v_due_date DATE;
    v_book_id INTEGER;
    v_days_late INTEGER;
    v_fine DECIMAL(10,2) := 0.00;
BEGIN
    -- Get loan details
    SELECT l.due_date, l.book_id INTO v_due_date, v_book_id
    FROM loans l WHERE l.id = p_loan_id AND l.return_date IS NULL;
    
    IF v_due_date IS NULL THEN
        RAISE EXCEPTION 'Loan not found or already returned';
    END IF;
    
    -- Calculate fine if overdue
    v_days_late := CURRENT_DATE - v_due_date;
    IF v_days_late > 0 THEN
        v_fine := v_days_late * p_fine_per_day;
    ELSE
        v_days_late := 0;
    END IF;
    
    -- Update loan record
    UPDATE loans 
    SET return_date = CURRENT_DATE,
        status = 'returned',
        fine_amount = v_fine
    WHERE id = p_loan_id;
    
    -- Increment available copies
    UPDATE books 
    SET available_copies = available_copies + 1 
    WHERE id = v_book_id;
    
    RETURN QUERY SELECT v_fine, v_days_late;
END;
$$ LANGUAGE plpgsql;

-- Function: Get most borrowed books
CREATE OR REPLACE FUNCTION sp_most_borrowed_books(
    p_limit INTEGER,
    p_days_back INTEGER
)
RETURNS TABLE(
    id INTEGER,
    title VARCHAR(255),
    isbn VARCHAR(13),
    borrow_count BIGINT,
    authors TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.title,
        b.isbn,
        COUNT(l.id) AS borrow_count,
        STRING_AGG(DISTINCT a.name, ', ') AS authors
    FROM books b
    JOIN loans l ON b.id = l.book_id
    LEFT JOIN book_authors ba ON b.id = ba.book_id
    LEFT JOIN authors a ON ba.author_id = a.id
    WHERE l.borrow_date >= CURRENT_DATE - p_days_back
    GROUP BY b.id, b.title, b.isbn
    ORDER BY borrow_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Update loan status to overdue
-- =====================================================
CREATE OR REPLACE FUNCTION update_overdue_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.return_date IS NULL AND CURRENT_DATE > NEW.due_date THEN
        NEW.status := 'overdue';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_overdue_status
    BEFORE UPDATE ON loans
    FOR EACH ROW
    EXECUTE FUNCTION update_overdue_status();
