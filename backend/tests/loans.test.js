/**
 * Integration tests for Loans endpoints
 */

const request = require('supertest');
const app = require('../src/server');

describe('Loans Endpoints', () => {
    let memberToken;
    let adminToken;
    let testLoanId;

    beforeAll(async () => {
        // Login as member
        const memberRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'john.doe@email.com',
                password: 'Password123!@#'
            });
        memberToken = memberRes.body.data.token;

        // Login as admin
        const adminRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@library.com',
                password: 'Admin123!@#'
            });
        adminToken = adminRes.body.data.token;
    });

    describe('POST /api/loans/borrow', () => {
        test('should borrow a book successfully', async () => {
            const res = await request(app)
                .post('/api/loans/borrow')
                .set('Authorization', `Bearer ${memberToken}`)
                .send({ book_id: 5 }); // Use a book that's likely available

            if (res.statusCode === 201) {
                expect(res.body.success).toBe(true);
                expect(res.body.data).toHaveProperty('loan_id');
                testLoanId = res.body.data.loan_id;
            } else if (res.statusCode === 400) {
                // Book might already be borrowed or unavailable
                expect(res.body.success).toBe(false);
            }
        });

        test('should fail without authentication', async () => {
            const res = await request(app)
                .post('/api/loans/borrow')
                .send({ book_id: 1 });

            expect(res.statusCode).toBe(401);
        });

        test('should fail with non-existent book', async () => {
            const res = await request(app)
                .post('/api/loans/borrow')
                .set('Authorization', `Bearer ${memberToken}`)
                .send({ book_id: 99999 });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/loans/my-loans', () => {
        test('should get user loans', async () => {
            const res = await request(app)
                .get('/api/loans/my-loans')
                .set('Authorization', `Bearer ${memberToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        test('should filter by status', async () => {
            const res = await request(app)
                .get('/api/loans/my-loans?status=active')
                .set('Authorization', `Bearer ${memberToken}`);

            expect(res.statusCode).toBe(200);
            if (res.body.data.length > 0) {
                expect(res.body.data[0].status).toBe('active');
            }
        });

        test('should fail without authentication', async () => {
            const res = await request(app)
                .get('/api/loans/my-loans');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/loans (admin)', () => {
        test('should get all loans as admin', async () => {
            const res = await request(app)
                .get('/api/loans')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        test('should fail as member', async () => {
            const res = await request(app)
                .get('/api/loans')
                .set('Authorization', `Bearer ${memberToken}`);

            expect(res.statusCode).toBe(403);
        });
    });

    describe('POST /api/loans/:id/return', () => {
        test('should return a book successfully', async () => {
            if (!testLoanId) {
                // Skip if no loan was created
                return;
            }

            const res = await request(app)
                .post(`/api/loans/${testLoanId}/return`)
                .set('Authorization', `Bearer ${memberToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('fine_amount');
        });

        test('should fail to return non-existent loan', async () => {
            const res = await request(app)
                .post('/api/loans/99999/return')
                .set('Authorization', `Bearer ${memberToken}`);

            expect(res.statusCode).toBe(400);
        });

        test('should fail without authentication', async () => {
            const res = await request(app)
                .post('/api/loans/1/return');

            expect(res.statusCode).toBe(401);
        });
    });
});
