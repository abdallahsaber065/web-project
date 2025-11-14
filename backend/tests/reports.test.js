/**
 * Integration tests for Reports endpoints
 */

const request = require('supertest');
const app = require('../src/server');

describe('Reports Endpoints', () => {
    let adminToken;
    let memberToken;

    beforeAll(async () => {
        // Login as admin
        const adminRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@library.com',
                password: 'Admin123!@#'
            });
        adminToken = adminRes.body.data.token;

        // Login as member
        const memberRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'john.doe@email.com',
                password: 'Password123!@#'
            });
        memberToken = memberRes.body.data.token;
    });

    describe('GET /api/reports/most-borrowed', () => {
        test('should get most borrowed books', async () => {
            const res = await request(app)
                .get('/api/reports/most-borrowed')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);

            if (res.body.data.length > 0) {
                expect(res.body.data[0]).toHaveProperty('borrow_count');
                expect(res.body.data[0]).toHaveProperty('title');
            }
        });

        test('should respect limit parameter', async () => {
            const res = await request(app)
                .get('/api/reports/most-borrowed?limit=5')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.body.data.length).toBeLessThanOrEqual(5);
        });

        test('should fail without authentication', async () => {
            const res = await request(app)
                .get('/api/reports/most-borrowed');

            expect(res.statusCode).toBe(401);
        });

        test('should fail as member', async () => {
            const res = await request(app)
                .get('/api/reports/most-borrowed')
                .set('Authorization', `Bearer ${memberToken}`);

            expect(res.statusCode).toBe(403);
        });
    });

    describe('GET /api/reports/overdue', () => {
        test('should get overdue loans', async () => {
            const res = await request(app)
                .get('/api/reports/overdue')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);

            if (res.body.data.length > 0) {
                expect(res.body.data[0]).toHaveProperty('days_overdue');
                expect(res.body.data[0]).toHaveProperty('calculated_fine');
            }
        });

        test('should fail without authentication', async () => {
            const res = await request(app)
                .get('/api/reports/overdue');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/reports/member-activity', () => {
        test('should get member activity', async () => {
            const res = await request(app)
                .get('/api/reports/member-activity')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);

            if (res.body.data.length > 0) {
                expect(res.body.data[0]).toHaveProperty('total_loans');
                expect(res.body.data[0]).toHaveProperty('active_loans');
            }
        });

        test('should fail as member', async () => {
            const res = await request(app)
                .get('/api/reports/member-activity')
                .set('Authorization', `Bearer ${memberToken}`);

            expect(res.statusCode).toBe(403);
        });
    });

    describe('GET /api/reports/statistics', () => {
        test('should get library statistics', async () => {
            const res = await request(app)
                .get('/api/reports/statistics')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('books');
            expect(res.body.data).toHaveProperty('loans');
            expect(res.body.data).toHaveProperty('reservations');
            expect(res.body.data).toHaveProperty('members');
            expect(res.body.data).toHaveProperty('fines');
        });

        test('should have correct statistics structure', async () => {
            const res = await request(app)
                .get('/api/reports/statistics')
                .set('Authorization', `Bearer ${adminToken}`);

            const stats = res.body.data;
            expect(stats.books).toHaveProperty('unique_titles');
            expect(stats.books).toHaveProperty('total_copies');
            expect(stats.books).toHaveProperty('available_copies');
            expect(stats.loans).toHaveProperty('active');
            expect(stats.loans).toHaveProperty('overdue');
        });
    });

    describe('GET /api/reports/loans-by-date', () => {
        test('should get loans by date range', async () => {
            const startDate = '2024-01-01';
            const endDate = '2024-12-31';

            const res = await request(app)
                .get(`/api/reports/loans-by-date?start_date=${startDate}&end_date=${endDate}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        test('should fail without date parameters', async () => {
            const res = await request(app)
                .get('/api/reports/loans-by-date')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(400);
        });

        test('should fail as member', async () => {
            const res = await request(app)
                .get('/api/reports/loans-by-date?start_date=2024-01-01&end_date=2024-12-31')
                .set('Authorization', `Bearer ${memberToken}`);

            expect(res.statusCode).toBe(403);
        });
    });
});
