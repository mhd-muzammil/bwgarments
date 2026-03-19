const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const supertest = require('supertest');
const { connect, clearDatabase, disconnect } = require('./setup');

// Set env before importing app modules
process.env.JWT_SECRET = 'test-jwt-secret-1234567890abcdef';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-1234567890abcdef';
process.env.JWT_EXPIRE = '15m';
process.env.JWT_REFRESH_EXPIRE = '7d';
process.env.NODE_ENV = 'test';

const User = require('../models/User');

// Build a minimal app for testing (avoids DB connection in server.js)
function createApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/auth', require('../routes/authRoutes'));

  const errorHandler = require('../middleware/errorHandler');
  app.use(errorHandler);
  return app;
}

let app, request;

beforeAll(async () => {
  await connect();
  app = createApp();
  request = supertest(app);
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await disconnect();
});

describe('POST /api/auth/register', () => {
  it('should register a new user', async () => {
    const res = await request.post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password1',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.role).toBe('user');
    // Access token should be in httpOnly cookie, not in response body
    expect(res.body.accessToken).toBeUndefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should reject duplicate email', async () => {
    await User.create({ name: 'Existing', email: 'test@example.com', password: 'Password1' });

    const res = await request.post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password1',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject weak password', async () => {
    const res = await request.post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'weak',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject invalid email', async () => {
    const res = await request.post('/api/auth/register').send({
      name: 'Test User',
      email: 'notanemail',
      password: 'Password1',
    });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await User.create({ name: 'Test User', email: 'test@example.com', password: 'Password1' });
  });

  it('should login with valid credentials', async () => {
    const res = await request.post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'Password1',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should reject wrong password', async () => {
    const res = await request.post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'WrongPassword1',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject non-existent email', async () => {
    const res = await request.post('/api/auth/login').send({
      email: 'nonexistent@example.com',
      password: 'Password1',
    });

    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/refresh', () => {
  it('should refresh tokens using refresh cookie', async () => {
    // Register to get cookies
    const registerRes = await request.post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password1',
    });

    const cookies = registerRes.headers['set-cookie'];

    const res = await request
      .post('/api/auth/refresh')
      .set('Cookie', cookies);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should reject without refresh token', async () => {
    const res = await request.post('/api/auth/refresh');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('should return current user when authenticated', async () => {
    const registerRes = await request.post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password1',
    });

    const cookies = registerRes.headers['set-cookie'];

    const res = await request
      .get('/api/auth/me')
      .set('Cookie', cookies);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('should reject unauthenticated request', async () => {
    const res = await request.get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('should logout and clear cookies', async () => {
    const registerRes = await request.post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password1',
    });

    const cookies = registerRes.headers['set-cookie'];

    const res = await request
      .post('/api/auth/logout')
      .set('Cookie', cookies);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
