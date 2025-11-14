-- Library Management System Database Schema
-- MySQL Database Schema

-- Drop existing database and create fresh
DROP DATABASE IF EXISTS library_management;
CREATE DATABASE library_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE library_management;

-- =====================================================
-- TABLE: users
-- Stores all system users (members, librarians, admins)
-- =====================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('member', 'librarian', 'admin') DEFAULT 'member' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: authors
-- Stores author information
-- =====================================================
CREATE TABLE authors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    biography TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: categories
-- Book categories/genres
-- =====================================================
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: books
-- Main book catalog
-- =====================================================
CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    isbn VARCHAR(13) UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    publisher VARCHAR(255),
    publication_year YEAR,
    total_copies INT NOT NULL DEFAULT 1 CHECK (total_copies >= 0),
    available_copies INT NOT NULL DEFAULT 1 CHECK (available_copies >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_title (title),
    INDEX idx_isbn (isbn),
    CONSTRAINT chk_available_copies CHECK (available_copies <= total_copies)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: book_authors
-- Many-to-many relationship between books and authors
-- =====================================================
CREATE TABLE book_authors (
    book_id INT NOT NULL,
    author_id INT NOT NULL,
    PRIMARY KEY (book_id, author_id),
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE,
    INDEX idx_book_id (book_id),
    INDEX idx_author_id (author_id)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: book_categories
-- Many-to-many relationship between books and categories
-- =====================================================
CREATE TABLE book_categories (
    book_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (book_id, category_id),
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_book_id (book_id),
    INDEX idx_category_id (category_id)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: loans
-- Tracks book borrowing transactions
-- =====================================================
CREATE TABLE loans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    fine_amount DECIMAL(10, 2) DEFAULT 0.00 CHECK (fine_amount >= 0),
    status ENUM('borrowed', 'returned', 'overdue') DEFAULT 'borrowed' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id),
    INDEX idx_book_id (book_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date),
    CONSTRAINT chk_due_date CHECK (due_date >= borrow_date)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: reservations
-- Manages book reservations
-- =====================================================
CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'cancelled', 'fulfilled') DEFAULT 'active' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_book_id (book_id),
    INDEX idx_status (status),
    INDEX idx_reserved_at (reserved_at)
) ENGINE=InnoDB;

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
    GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR ', ') AS authors,
    GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ') AS categories
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
    DATEDIFF(CURDATE(), l.due_date) AS days_overdue
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
-- STORED PROCEDURES
-- =====================================================

-- Procedure: Borrow a book
DELIMITER //
CREATE PROCEDURE sp_borrow_book(
    IN p_user_id INT,
    IN p_book_id INT,
    IN p_loan_duration_days INT
)
BEGIN
    DECLARE v_available_copies INT;
    DECLARE v_user_active_loans INT;
    DECLARE v_max_loans INT DEFAULT 5;
    
    -- Check available copies
    SELECT available_copies INTO v_available_copies
    FROM books WHERE id = p_book_id;
    
    IF v_available_copies <= 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'No available copies of this book';
    END IF;
    
    -- Check user's current active loans
    SELECT COUNT(*) INTO v_user_active_loans
    FROM loans 
    WHERE user_id = p_user_id AND return_date IS NULL;
    
    IF v_user_active_loans >= v_max_loans THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'User has reached maximum loan limit';
    END IF;
    
    -- Create loan record
    INSERT INTO loans (user_id, book_id, borrow_date, due_date)
    VALUES (p_user_id, p_book_id, CURDATE(), DATE_ADD(CURDATE(), INTERVAL p_loan_duration_days DAY));
    
    -- Decrement available copies
    UPDATE books 
    SET available_copies = available_copies - 1 
    WHERE id = p_book_id;
    
    SELECT LAST_INSERT_ID() AS loan_id;
END //
DELIMITER ;

-- Procedure: Return a book
DELIMITER //
CREATE PROCEDURE sp_return_book(
    IN p_loan_id INT,
    IN p_fine_per_day DECIMAL(10,2)
)
BEGIN
    DECLARE v_due_date DATE;
    DECLARE v_book_id INT;
    DECLARE v_days_late INT;
    DECLARE v_fine DECIMAL(10,2) DEFAULT 0.00;
    
    -- Get loan details
    SELECT due_date, book_id INTO v_due_date, v_book_id
    FROM loans WHERE id = p_loan_id AND return_date IS NULL;
    
    IF v_due_date IS NULL THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Loan not found or already returned';
    END IF;
    
    -- Calculate fine if overdue
    SET v_days_late = DATEDIFF(CURDATE(), v_due_date);
    IF v_days_late > 0 THEN
        SET v_fine = v_days_late * p_fine_per_day;
    END IF;
    
    -- Update loan record
    UPDATE loans 
    SET return_date = CURDATE(),
        status = 'returned',
        fine_amount = v_fine
    WHERE id = p_loan_id;
    
    -- Increment available copies
    UPDATE books 
    SET available_copies = available_copies + 1 
    WHERE id = v_book_id;
    
    SELECT v_fine AS fine_amount, v_days_late AS days_late;
END //
DELIMITER ;

-- Procedure: Get most borrowed books
DELIMITER //
CREATE PROCEDURE sp_most_borrowed_books(
    IN p_limit INT,
    IN p_days_back INT
)
BEGIN
    SELECT 
        b.id,
        b.title,
        b.isbn,
        COUNT(l.id) AS borrow_count,
        GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') AS authors
    FROM books b
    JOIN loans l ON b.id = l.book_id
    LEFT JOIN book_authors ba ON b.id = ba.book_id
    LEFT JOIN authors a ON ba.author_id = a.id
    WHERE l.borrow_date >= DATE_SUB(CURDATE(), INTERVAL p_days_back DAY)
    GROUP BY b.id
    ORDER BY borrow_count DESC
    LIMIT p_limit;
END //
DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Update loan status to overdue
DELIMITER //
CREATE TRIGGER trg_update_overdue_status
BEFORE UPDATE ON loans
FOR EACH ROW
BEGIN
    IF NEW.return_date IS NULL AND CURDATE() > NEW.due_date THEN
        SET NEW.status = 'overdue';
    END IF;
END //
DELIMITER ;

-- Grant permissions (adjust for your environment)
-- GRANT ALL PRIVILEGES ON library_management.* TO 'library_user'@'localhost';
-- FLUSH PRIVILEGES;
