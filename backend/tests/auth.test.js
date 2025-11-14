/**
 * Integration tests for Authentication endpoints
 */

const request = require('supertest');
const app = require('../src/server');

describe('Auth Endpoints', () => {
    let authToken;
    const testUser = {
        email: 'test_' + Date.now() + '@example.com',
        password: 'Test123!@#',
        name: 'Test User',
        phone: '1234567890'
    };

    describe('POST /api/auth/register', () => {
        test('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user).toHaveProperty('id');
            expect(res.body.data.user.email).toBe(testUser.email);
            expect(res.body.data.user.role).toBe('member');
        });

        test('should fail with duplicate email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('should fail with invalid email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    ...testUser,
                    email: 'invalid-email'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('should fail with weak password', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    ...testUser,
                    email: 'weak_' + Date.now() + '@example.com',
                    password: '123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/login', () => {
        test('should login successfully with correct credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user.email).toBe(testUser.email);

            authToken = res.body.data.token;
        });

        test('should fail with incorrect password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'WrongPassword123!'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });

        test('should fail with non-existent user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'Password123!'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/auth/profile', () => {
        test('should get user profile with valid token', async () => {
            const res = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toBe(testUser.email);
            expect(res.body.data).not.toHaveProperty('password');
        });

        test('should fail without authentication', async () => {
            const res = await request(app)
                .get('/api/auth/profile');

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });

        test('should fail with invalid token', async () => {
            const res = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', 'Bearer invalid_token');

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });
});
