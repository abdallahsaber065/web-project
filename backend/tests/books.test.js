/**
 * Integration tests for Books endpoints
 */

const request = require('supertest');
const app = require('../src/server');

describe('Books Endpoints', () => {
    let adminToken;
    let memberToken;
    let testBookId;

    beforeAll(async () => {
        // Login as admin
        const adminRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@library.com',
                password: 'password123'
            });
        adminToken = adminRes.body.data.token;

        // Login as member
        const memberRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'john.smith@email.com',
                password: 'password123'
            });
        memberToken = memberRes.body.data.token;
    });

    describe('GET /api/books', () => {
        test('should get all books without authentication', async () => {
            const res = await request(app).get('/api/books');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('books');
            expect(res.body.data).toHaveProperty('pagination');
            expect(Array.isArray(res.body.data.books)).toBe(true);
        });

        test('should filter books by category', async () => {
            const res = await request(app)
                .get('/api/books?category=1');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        test('should search books by title', async () => {
            const res = await request(app)
                .get('/api/books?search=pride');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            if (res.body.data.books.length > 0) {
                expect(res.body.data.books[0].title.toLowerCase()).toContain('pride');
            }
        });

        test('should paginate results', async () => {
            const res = await request(app)
                .get('/api/books?page=1&limit=5');

            expect(res.statusCode).toBe(200);
            expect(res.body.data.books.length).toBeLessThanOrEqual(5);
            expect(res.body.data.pagination.limit).toBe(5);
        });
    });

    describe('GET /api/books/:id', () => {
        test('should get book details by ID', async () => {
            const res = await request(app).get('/api/books/1');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data).toHaveProperty('title');
        });

        test('should return 404 for non-existent book', async () => {
            const res = await request(app).get('/api/books/99999');

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/books', () => {
        test('should create book as librarian', async () => {
            const newBook = {
                title: 'Test Book',
                isbn: '1234567890123',
                publisher: 'Test Publisher',
                publication_year: 2024,
                total_copies: 3,
                description: 'A test book',
                author_ids: [1],
                category_ids: [1]
            };

            const res = await request(app)
                .post('/api/books')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newBook);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id');

            testBookId = res.body.data.id;
        });

        test('should fail without authentication', async () => {
            const res = await request(app)
                .post('/api/books')
                .send({ title: 'Test' });

            expect(res.statusCode).toBe(401);
        });

        test('should fail as member role', async () => {
            const res = await request(app)
                .post('/api/books')
                .set('Authorization', `Bearer ${memberToken}`)
                .send({ title: 'Test' });

            expect(res.statusCode).toBe(403);
        });
    });

    describe('PUT /api/books/:id', () => {
        test('should update book as librarian', async () => {
            const updates = {
                title: 'Updated Test Book',
                total_copies: 5
            };

            const res = await request(app)
                .put(`/api/books/${testBookId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updates);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Book updated successfully');
        });

        test('should fail without authentication', async () => {
            const res = await request(app)
                .put(`/api/books/${testBookId}`)
                .send({ title: 'Updated' });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('DELETE /api/books/:id', () => {
        test('should fail as librarian (admin only)', async () => {
            // First, create a librarian token
            const librarianRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'sarah.j@library.com',
                    password: 'password123'
                });
            const librarianToken = librarianRes.body.data.token;

            const res = await request(app)
                .delete(`/api/books/${testBookId}`)
                .set('Authorization', `Bearer ${librarianToken}`);

            expect(res.statusCode).toBe(403);
        });

        test('should delete book as admin', async () => {
            if (!testBookId) {
                // Skip if book wasn't created
                return;
            }

            const res = await request(app)
                .delete(`/api/books/${testBookId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        test('should return 404 after deletion', async () => {
            if (!testBookId) {
                // Skip if book wasn't created or deleted
                return;
            }

            const res = await request(app)
                .get(`/api/books/${testBookId}`);

            expect(res.statusCode).toBe(404);
        });
    });
});
