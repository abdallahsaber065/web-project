-- Library Management System - Sample Data
-- Run this after schema.sql to populate the database with test data

USE library_management;

-- =====================================================
-- SEED DATA: Users
-- Password for all users: "password123" (hashed with bcrypt)
-- =====================================================

-- Admin user
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin User', 'admin@library.com', '$2b$10$rKZM8qY3LX7vZ5YhF.WJUOxKXxNZ4J8FHlJ3h2KqVLWxGKqM1yZHi', 'admin');

-- Librarian users
INSERT INTO users (name, email, password_hash, role) VALUES
('Sarah Johnson', 'sarah.j@library.com', '$2b$10$rKZM8qY3LX7vZ5YhF.WJUOxKXxNZ4J8FHlJ3h2KqVLWxGKqM1yZHi', 'librarian'),
('Michael Chen', 'michael.c@library.com', '$2b$10$rKZM8qY3LX7vZ5YhF.WJUOxKXxNZ4J8FHlJ3h2KqVLWxGKqM1yZHi', 'librarian');

-- Member users
INSERT INTO users (name, email, password_hash, role) VALUES
('John Smith', 'john.smith@email.com', '$2b$10$rKZM8qY3LX7vZ5YhF.WJUOxKXxNZ4J8FHlJ3h2KqVLWxGKqM1yZHi', 'member'),
('Emily Davis', 'emily.davis@email.com', '$2b$10$rKZM8qY3LX7vZ5YhF.WJUOxKXxNZ4J8FHlJ3h2KqVLWxGKqM1yZHi', 'member'),
('James Wilson', 'james.wilson@email.com', '$2b$10$rKZM8qY3LX7vZ5YhF.WJUOxKXxNZ4J8FHlJ3h2KqVLWxGKqM1yZHi', 'member'),
('Sophia Martinez', 'sophia.m@email.com', '$2b$10$rKZM8qY3LX7vZ5YhF.WJUOxKXxNZ4J8FHlJ3h2KqVLWxGKqM1yZHi', 'member'),
('Oliver Brown', 'oliver.b@email.com', '$2b$10$rKZM8qY3LX7vZ5YhF.WJUOxKXxNZ4J8FHlJ3h2KqVLWxGKqM1yZHi', 'member'),
('Isabella Taylor', 'isabella.t@email.com', '$2b$10$rKZM8qY3LX7vZ5YhF.WJUOxKXxNZ4J8FHlJ3h2KqVLWxGKqM1yZHi', 'member'),
('William Anderson', 'william.a@email.com', '$2b$10$rKZM8qY3LX7vZ5YhF.WJUOxKXxNZ4J8FHlJ3h2KqVLWxGKqM1yZHi', 'member'),
('Emma Thomas', 'emma.thomas@email.com', '$2b$10$rKZM8qY3LX7vZ5YhF.WJUOxKXxNZ4J8FHlJ3h2KqVLWxGKqM1yZHi', 'member');

-- =====================================================
-- SEED DATA: Categories
-- =====================================================
INSERT INTO categories (name, description) VALUES
('Fiction', 'Literary works based on imagination'),
('Non-Fiction', 'Factual books and informational texts'),
('Science Fiction', 'Speculative fiction based on scientific concepts'),
('Fantasy', 'Fiction involving magic and supernatural elements'),
('Mystery', 'Crime and detective fiction'),
('Romance', 'Love and relationship-focused stories'),
('Biography', 'Life stories of real people'),
('History', 'Historical events and accounts'),
('Science', 'Scientific topics and research'),
('Technology', 'Computing, engineering, and technical subjects'),
('Self-Help', 'Personal development and improvement'),
('Business', 'Business, economics, and management'),
('Children', 'Books for young readers'),
('Young Adult', 'Books targeting teenage readers'),
('Poetry', 'Collections of poems');

-- =====================================================
-- SEED DATA: Authors
-- =====================================================
INSERT INTO authors (name, biography) VALUES
('George Orwell', 'English novelist and essayist, best known for his dystopian novels.'),
('J.K. Rowling', 'British author, creator of the Harry Potter series.'),
('Isaac Asimov', 'American science fiction writer and professor of biochemistry.'),
('Agatha Christie', 'English writer known for detective novels.'),
('Stephen King', 'American author of horror, supernatural fiction, and suspense.'),
('Jane Austen', 'English novelist known for romantic fiction.'),
('Ernest Hemingway', 'American novelist and short-story writer.'),
('Harper Lee', 'American novelist, author of To Kill a Mockingbird.'),
('F. Scott Fitzgerald', 'American novelist of the Jazz Age.'),
('J.R.R. Tolkien', 'English writer and philologist, author of The Lord of the Rings.'),
('Gabriel García Márquez', 'Colombian novelist and Nobel Prize winner.'),
('Margaret Atwood', 'Canadian poet and novelist.'),
('Yuval Noah Harari', 'Israeli historian and author.'),
('Malcolm Gladwell', 'Canadian journalist and author.'),
('Michelle Obama', 'American attorney and former First Lady.'),
('Walter Isaacson', 'American author and journalist.'),
('Dale Carnegie', 'American writer and lecturer on self-improvement.'),
('Robert Kiyosaki', 'American businessman and author.'),
('Paulo Coelho', 'Brazilian lyricist and novelist.'),
('Khaled Hosseini', 'Afghan-American novelist and physician.');

-- =====================================================
-- SEED DATA: Books
-- =====================================================
INSERT INTO books (isbn, title, description, publisher, publication_year, total_copies, available_copies) VALUES
('9780451524935', '1984', 'A dystopian social science fiction novel and cautionary tale about totalitarianism.', 'Penguin Books', 1949, 5, 5),
('9780439708180', 'Harry Potter and the Sorcerer''s Stone', 'The first novel in the Harry Potter series about a young wizard.', 'Scholastic', 1997, 8, 6),
('9780553293357', 'Foundation', 'A science fiction novel about the fall of a Galactic Empire.', 'Bantam Books', 1951, 3, 3),
('9780062073488', 'Murder on the Orient Express', 'A detective novel featuring Hercule Poirot.', 'HarperCollins', 1934, 4, 4),
('9781501142970', 'The Shining', 'A horror novel about a family in an isolated hotel.', 'Doubleday', 1977, 6, 5),
('9780141439518', 'Pride and Prejudice', 'A romantic novel of manners.', 'Penguin Classics', 1813, 4, 3),
('9780684801223', 'The Old Man and the Sea', 'A short novel about an aging fisherman.', 'Scribner', 1952, 3, 3),
('9780060935467', 'To Kill a Mockingbird', 'A novel about racial injustice in the Deep South.', 'Harper Perennial', 1960, 7, 6),
('9780743273565', 'The Great Gatsby', 'A novel about the American Dream in the 1920s.', 'Scribner', 1925, 5, 4),
('9780618640157', 'The Lord of the Rings', 'An epic high-fantasy novel trilogy.', 'Houghton Mifflin', 1954, 6, 5),
('9780060883287', 'One Hundred Years of Solitude', 'A landmark novel of magical realism.', 'Harper Perennial', 1967, 3, 3),
('9780385490818', 'The Handmaid''s Tale', 'A dystopian novel about a totalitarian society.', 'Anchor Books', 1985, 5, 4),
('9780062316097', 'Sapiens: A Brief History of Humankind', 'An exploration of human history from the Stone Age to modern times.', 'Harper', 2011, 10, 8),
('9780316346627', 'Outliers: The Story of Success', 'An examination of what makes high-achievers different.', 'Little, Brown', 2008, 6, 5),
('9781524763138', 'Becoming', 'A memoir by Michelle Obama.', 'Crown', 2018, 8, 7),
('9781501127625', 'Steve Jobs', 'The authorized biography of Steve Jobs.', 'Simon & Schuster', 2011, 4, 4),
('9780671027032', 'How to Win Friends and Influence People', 'A self-help book about interpersonal skills.', 'Pocket Books', 1936, 5, 5),
('9781612680194', 'Rich Dad Poor Dad', 'A book about personal finance and investing.', 'Plata Publishing', 1997, 7, 6),
('9780062315007', 'The Alchemist', 'A philosophical novel about following your dreams.', 'HarperOne', 1988, 9, 7),
('9781594631931', 'The Kite Runner', 'A novel about friendship and redemption in Afghanistan.', 'Riverhead Books', 2003, 6, 5),
('9780439139595', 'Harry Potter and the Goblet of Fire', 'The fourth Harry Potter novel.', 'Scholastic', 2000, 7, 7),
('9780553380163', 'I, Robot', 'A collection of science fiction short stories.', 'Bantam Books', 1950, 4, 4),
('9780316769174', 'The Catcher in the Rye', 'A novel about teenage rebellion and alienation.', 'Little, Brown', 1951, 5, 5),
('9780544003415', 'The Hobbit', 'A fantasy novel and prelude to The Lord of the Rings.', 'Houghton Mifflin', 1937, 6, 6),
('9780345391803', 'The Hitchhiker''s Guide to the Galaxy', 'A comedic science fiction series.', 'Del Rey', 1979, 5, 5);

-- =====================================================
-- SEED DATA: Book-Author Relationships
-- =====================================================
INSERT INTO book_authors (book_id, author_id) VALUES
(1, 1),   -- 1984 by George Orwell
(2, 2),   -- Harry Potter 1 by J.K. Rowling
(3, 3),   -- Foundation by Isaac Asimov
(4, 4),   -- Murder on Orient Express by Agatha Christie
(5, 5),   -- The Shining by Stephen King
(6, 6),   -- Pride and Prejudice by Jane Austen
(7, 7),   -- Old Man and the Sea by Ernest Hemingway
(8, 8),   -- To Kill a Mockingbird by Harper Lee
(9, 9),   -- The Great Gatsby by F. Scott Fitzgerald
(10, 10), -- LOTR by J.R.R. Tolkien
(11, 11), -- One Hundred Years by Gabriel García Márquez
(12, 12), -- Handmaid's Tale by Margaret Atwood
(13, 13), -- Sapiens by Yuval Noah Harari
(14, 14), -- Outliers by Malcolm Gladwell
(15, 15), -- Becoming by Michelle Obama
(16, 16), -- Steve Jobs by Walter Isaacson
(17, 17), -- How to Win Friends by Dale Carnegie
(18, 18), -- Rich Dad Poor Dad by Robert Kiyosaki
(19, 19), -- The Alchemist by Paulo Coelho
(20, 20), -- The Kite Runner by Khaled Hosseini
(21, 2),  -- Harry Potter 4 by J.K. Rowling
(22, 3),  -- I, Robot by Isaac Asimov
(23, 5),  -- Catcher in the Rye (assuming same author for demo)
(24, 10), -- The Hobbit by J.R.R. Tolkien
(25, 3);  -- Hitchhiker's Guide (for demo, using Asimov)

-- =====================================================
-- SEED DATA: Book-Category Relationships
-- =====================================================
INSERT INTO book_categories (book_id, category_id) VALUES
(1, 1),   -- 1984: Fiction
(1, 3),   -- 1984: Science Fiction
(2, 4),   -- HP1: Fantasy
(2, 13),  -- HP1: Children
(3, 3),   -- Foundation: Science Fiction
(4, 5),   -- Murder: Mystery
(5, 1),   -- Shining: Fiction (Horror under Fiction)
(6, 1),   -- Pride: Fiction
(6, 6),   -- Pride: Romance
(7, 1),   -- Old Man: Fiction
(8, 1),   -- Mockingbird: Fiction
(9, 1),   -- Gatsby: Fiction
(10, 4),  -- LOTR: Fantasy
(10, 1),  -- LOTR: Fiction
(11, 1),  -- One Hundred Years: Fiction
(12, 1),  -- Handmaid: Fiction
(12, 3),  -- Handmaid: Science Fiction
(13, 2),  -- Sapiens: Non-Fiction
(13, 8),  -- Sapiens: History
(14, 2),  -- Outliers: Non-Fiction
(14, 11), -- Outliers: Self-Help
(15, 7),  -- Becoming: Biography
(15, 2),  -- Becoming: Non-Fiction
(16, 7),  -- Steve Jobs: Biography
(16, 10), -- Steve Jobs: Technology
(17, 11), -- How to Win: Self-Help
(18, 12), -- Rich Dad: Business
(18, 11), -- Rich Dad: Self-Help
(19, 1),  -- Alchemist: Fiction
(20, 1),  -- Kite Runner: Fiction
(21, 4),  -- HP4: Fantasy
(21, 14), -- HP4: Young Adult
(22, 3),  -- I Robot: Science Fiction
(23, 1),  -- Catcher: Fiction
(23, 14), -- Catcher: Young Adult
(24, 4),  -- Hobbit: Fantasy
(24, 13), -- Hobbit: Children
(25, 3);  -- Hitchhiker: Science Fiction

-- =====================================================
-- SEED DATA: Sample Loans (some active, some returned)
-- =====================================================

-- Active loans
INSERT INTO loans (user_id, book_id, borrow_date, due_date, return_date, status) VALUES
(4, 2, DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 9 DAY), NULL, 'borrowed'),
(5, 10, DATE_SUB(CURDATE(), INTERVAL 7 DAY), DATE_ADD(CURDATE(), INTERVAL 7 DAY), NULL, 'borrowed'),
(6, 5, DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 4 DAY), NULL, 'borrowed'),
(7, 13, DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_ADD(CURDATE(), INTERVAL 11 DAY), NULL, 'borrowed');

-- Overdue loans
INSERT INTO loans (user_id, book_id, borrow_date, due_date, return_date, status, fine_amount) VALUES
(8, 12, DATE_SUB(CURDATE(), INTERVAL 20 DAY), DATE_SUB(CURDATE(), INTERVAL 6 DAY), NULL, 'overdue', 3.00),
(9, 6, DATE_SUB(CURDATE(), INTERVAL 18 DAY), DATE_SUB(CURDATE(), INTERVAL 4 DAY), NULL, 'overdue', 2.00);

-- Returned loans (past)
INSERT INTO loans (user_id, book_id, borrow_date, due_date, return_date, status, fine_amount) VALUES
(4, 8, DATE_SUB(CURDATE(), INTERVAL 30 DAY), DATE_SUB(CURDATE(), INTERVAL 16 DAY), DATE_SUB(CURDATE(), INTERVAL 15 DAY), 'returned', 0.00),
(5, 9, DATE_SUB(CURDATE(), INTERVAL 25 DAY), DATE_SUB(CURDATE(), INTERVAL 11 DAY), DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'returned', 0.00),
(6, 19, DATE_SUB(CURDATE(), INTERVAL 22 DAY), DATE_SUB(CURDATE(), INTERVAL 8 DAY), DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'returned', 1.00),
(7, 14, DATE_SUB(CURDATE(), INTERVAL 20 DAY), DATE_SUB(CURDATE(), INTERVAL 6 DAY), DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'returned', 0.00),
(8, 20, DATE_SUB(CURDATE(), INTERVAL 35 DAY), DATE_SUB(CURDATE(), INTERVAL 21 DAY), DATE_SUB(CURDATE(), INTERVAL 20 DAY), 'returned', 0.00);

-- Update available copies based on active loans
UPDATE books SET available_copies = available_copies - 1 WHERE id = 2;
UPDATE books SET available_copies = available_copies - 1 WHERE id = 10;
UPDATE books SET available_copies = available_copies - 1 WHERE id = 5;
UPDATE books SET available_copies = available_copies - 1 WHERE id = 13;
UPDATE books SET available_copies = available_copies - 1 WHERE id = 12;
UPDATE books SET available_copies = available_copies - 1 WHERE id = 6;

-- =====================================================
-- SEED DATA: Sample Reservations
-- =====================================================
INSERT INTO reservations (user_id, book_id, status) VALUES
(10, 13, 'active'),  -- Emma reserved Sapiens
(11, 2, 'active');   -- William reserved HP1

-- =====================================================
-- Verification Queries
-- =====================================================

-- Display summary
SELECT 'Database seeded successfully!' AS message;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_books FROM books;
SELECT COUNT(*) AS total_authors FROM authors;
SELECT COUNT(*) AS total_categories FROM categories;
SELECT COUNT(*) AS total_loans FROM loans;
SELECT COUNT(*) AS active_loans FROM loans WHERE return_date IS NULL;
SELECT COUNT(*) AS active_reservations FROM reservations WHERE status = 'active';
