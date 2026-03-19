const express = require('express');
const cookieParser = require('cookie-parser');
const supertest = require('supertest');
const { connect, clearDatabase, disconnect } = require('./setup');

process.env.JWT_SECRET = 'test-jwt-secret-1234567890abcdef';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-1234567890abcdef';
process.env.JWT_EXPIRE = '15m';
process.env.JWT_REFRESH_EXPIRE = '7d';
process.env.NODE_ENV = 'test';

const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/auth', require('../routes/authRoutes'));
  app.use('/api/cart', require('../routes/cartRoutes'));
  app.use('/api/orders', require('../routes/orderRoutes'));
  app.use(require('../middleware/errorHandler'));
  return app;
}

let app, request;

const testProduct = {
  title: 'Test Kurta',
  description: 'A test product description',
  images: ['https://example.com/img1.jpg'],
  price: 1999,
  discount: 999,
  sizes: [
    { size: 'S', stock: 5 },
    { size: 'M', stock: 10 },
    { size: 'L', stock: 3 },
  ],
  sku: 'TEST-001',
  mainCategory: 'Women',
  subCategory: 'Kurtis',
};

const shippingAddress = {
  fullName: 'Test User',
  phone: '9876543210',
  addressLine1: '123 Test Street',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
};

async function registerAndGetCookies(request) {
  const res = await request.post('/api/auth/register').send({
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password1',
  });
  return res.headers['set-cookie'];
}

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

describe('Cart Operations', () => {
  let cookies, product;

  beforeEach(async () => {
    cookies = await registerAndGetCookies(request);
    product = await Product.create(testProduct);
  });

  it('should add item to cart', async () => {
    const res = await request
      .post('/api/cart')
      .set('Cookie', cookies)
      .send({ productId: product._id, size: 'M', quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].quantity).toBe(2);
  });

  it('should reject adding more than available stock', async () => {
    const res = await request
      .post('/api/cart')
      .set('Cookie', cookies)
      .send({ productId: product._id, size: 'L', quantity: 5 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject invalid size', async () => {
    const res = await request
      .post('/api/cart')
      .set('Cookie', cookies)
      .send({ productId: product._id, size: 'XXXL', quantity: 1 });

    expect(res.status).toBe(400);
  });

  it('should update cart item quantity', async () => {
    // Add item first
    const addRes = await request
      .post('/api/cart')
      .set('Cookie', cookies)
      .send({ productId: product._id, size: 'M', quantity: 1 });

    const itemId = addRes.body.data.items[0]._id;

    const res = await request
      .put(`/api/cart/${itemId}`)
      .set('Cookie', cookies)
      .send({ quantity: 5 });

    expect(res.status).toBe(200);
    expect(res.body.data.items[0].quantity).toBe(5);
  });

  it('should remove item from cart', async () => {
    const addRes = await request
      .post('/api/cart')
      .set('Cookie', cookies)
      .send({ productId: product._id, size: 'M', quantity: 1 });

    const itemId = addRes.body.data.items[0]._id;

    const res = await request
      .delete(`/api/cart/${itemId}`)
      .set('Cookie', cookies);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(0);
  });
});

describe('Checkout', () => {
  let cookies, product;

  beforeEach(async () => {
    cookies = await registerAndGetCookies(request);
    product = await Product.create(testProduct);
  });

  it('should create an order and decrement stock', async () => {
    // Add to cart
    await request
      .post('/api/cart')
      .set('Cookie', cookies)
      .send({ productId: product._id, size: 'M', quantity: 3 });

    // Checkout
    const res = await request
      .post('/api/orders/checkout')
      .set('Cookie', cookies)
      .send({ shippingAddress });

    expect(res.status).toBe(201);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.totalAmount).toBe(999 * 3); // discount price
    expect(res.body.data.orderStatus).toBe('processing');

    // Verify stock was decremented (use lean() to bypass mongoose cache)
    const updatedProduct = await Product.findById(product._id).lean();
    const mSize = updatedProduct.sizes.find((s) => s.size === 'M');
    expect(mSize.stock).toBe(7); // 10 - 3

    // Verify cart is cleared
    const cart = await Cart.findOne({ user: res.body.data.user });
    expect(cart.items).toHaveLength(0);
  });

  it('should reject checkout with empty cart', async () => {
    const res = await request
      .post('/api/orders/checkout')
      .set('Cookie', cookies)
      .send({ shippingAddress });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/cart is empty/i);
  });

  it('should reject checkout with invalid shipping address', async () => {
    await request
      .post('/api/cart')
      .set('Cookie', cookies)
      .send({ productId: product._id, size: 'M', quantity: 1 });

    const res = await request
      .post('/api/orders/checkout')
      .set('Cookie', cookies)
      .send({ shippingAddress: { fullName: 'Test' } }); // Missing fields

    expect(res.status).toBe(400);
  });

  it('should reject checkout when stock is insufficient', async () => {
    // Create a product with very low stock
    const lowStockProduct = await Product.create({
      ...testProduct,
      sku: 'TEST-LOW-001',
      sizes: [
        { size: 'S', stock: 1 },
        { size: 'M', stock: 1 },
        { size: 'L', stock: 1 },
      ],
    });

    // Add 1 to cart (valid at add time)
    await request
      .post('/api/cart')
      .set('Cookie', cookies)
      .send({ productId: lowStockProduct._id, size: 'L', quantity: 1 });

    // Directly zero the stock to simulate another user buying it first
    await Product.updateOne(
      { _id: lowStockProduct._id, 'sizes.size': 'L' },
      { $set: { 'sizes.$.stock': 0 } }
    );

    const res = await request
      .post('/api/orders/checkout')
      .set('Cookie', cookies)
      .send({ shippingAddress });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/insufficient stock/i);
  });

  it('should return user orders after checkout', async () => {
    // Add and checkout
    await request
      .post('/api/cart')
      .set('Cookie', cookies)
      .send({ productId: product._id, size: 'S', quantity: 1 });

    await request
      .post('/api/orders/checkout')
      .set('Cookie', cookies)
      .send({ shippingAddress });

    // Get orders
    const res = await request
      .get('/api/orders')
      .set('Cookie', cookies);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].items[0].title).toBe('Test Kurta');
  });
});
