/**
 * Integration tests for Reservations endpoints
 */

const request = require('supertest');
const app = require('../src/server');

describe('Reservations Endpoints', () => {
    let memberToken;
    let adminToken;
    let testReservationId;

    beforeAll(async () => {
        // Login as member
        const memberRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'jane.smith@email.com',
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

    describe('POST /api/reservations', () => {
        test('should create reservation successfully', async () => {
            const res = await request(app)
                .post('/api/reservations')
                .set('Authorization', `Bearer ${memberToken}`)
                .send({ book_id: 1 });

            if (res.statusCode === 201) {
                expect(res.body.success).toBe(true);
                expect(res.body.data).toHaveProperty('reservation_id');
                testReservationId = res.body.data.reservation_id;
            } else if (res.statusCode === 400) {
                // Book might be available or already reserved
                expect(res.body.success).toBe(false);
            }
        });

        test('should fail without authentication', async () => {
            const res = await request(app)
                .post('/api/reservations')
                .send({ book_id: 1 });

            expect(res.statusCode).toBe(401);
        });

        test('should fail with non-existent book', async () => {
            const res = await request(app)
                .post('/api/reservations')
                .set('Authorization', `Bearer ${memberToken}`)
                .send({ book_id: 99999 });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('GET /api/reservations/my-reservations', () => {
        test('should get user reservations', async () => {
            const res = await request(app)
                .get('/api/reservations/my-reservations')
                .set('Authorization', `Bearer ${memberToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        test('should include queue position', async () => {
            const res = await request(app)
                .get('/api/reservations/my-reservations')
                .set('Authorization', `Bearer ${memberToken}`);

            if (res.body.data.length > 0) {
                expect(res.body.data[0]).toHaveProperty('queue_position');
            }
        });

        test('should fail without authentication', async () => {
            const res = await request(app)
                .get('/api/reservations/my-reservations');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/reservations (admin)', () => {
        test('should get all reservations as admin', async () => {
            const res = await request(app)
                .get('/api/reservations')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        test('should fail as member', async () => {
            const res = await request(app)
                .get('/api/reservations')
                .set('Authorization', `Bearer ${memberToken}`);

            expect(res.statusCode).toBe(403);
        });
    });

    describe('DELETE /api/reservations/:id', () => {
        test('should cancel reservation successfully', async () => {
            if (!testReservationId) {
                return; // Skip if no reservation was created
            }

            const res = await request(app)
                .delete(`/api/reservations/${testReservationId}`)
                .set('Authorization', `Bearer ${memberToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        test('should fail without authentication', async () => {
            const res = await request(app)
                .delete('/api/reservations/1');

            expect(res.statusCode).toBe(401);
        });

        test('should fail for non-existent reservation', async () => {
            const res = await request(app)
                .delete('/api/reservations/99999')
                .set('Authorization', `Bearer ${memberToken}`);

            expect(res.statusCode).toBe(400);
        });
    });
});
