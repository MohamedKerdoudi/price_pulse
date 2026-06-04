import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../src/index.js';
import pool from '../../src/config/database.js';
import { stopPriceSimulator } from '../../src/services/priceSimulator.js';

beforeAll(async () => {
  stopPriceSimulator();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      url VARCHAR(2048) NOT NULL,
      name VARCHAR(255) NOT NULL,
      initial_price DECIMAL(10, 2) NOT NULL,
      current_price DECIMAL(10, 2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'EUR',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS price_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID REFERENCES products(id) ON DELETE CASCADE,
      price DECIMAL(10, 2) NOT NULL,
      recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
});

afterAll(async () => {
  stopPriceSimulator();
  await pool.query('DROP TABLE IF EXISTS price_history');
  await pool.query('DROP TABLE IF EXISTS products');
  await pool.end();
});

describe('Products API', () => {
  const testProduct = {
    url: 'https://example.com/product/test',
    name: 'Integration Test Product',
    price: 49.99,
  };

  let createdProductId: string;

  it('POST /api/products should create a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .send(testProduct)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(testProduct.name);
    expect(res.body.url).toBe(testProduct.url);
    expect(res.body.initialPrice).toBe(testProduct.price);
    expect(res.body.currentPrice).toBe(testProduct.price);
    expect(res.body.trend).toBe('stable');
    expect(res.body.currency).toBe('EUR');
    expect(res.body.isActive).toBe(true);

    createdProductId = res.body.id;
  });

  it('GET /api/products should return paginated products', async () => {
    const res = await request(app)
      .get('/api/products')
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('limit');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('totalPages');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/products/:id should return a single product', async () => {
    const res = await request(app)
      .get(`/api/products/${createdProductId}`)
      .expect(200);

    expect(res.body.id).toBe(createdProductId);
    expect(res.body.name).toBe(testProduct.name);
  });

  it('GET /api/products/:id should return 404 for non-existent product', async () => {
    const res = await request(app)
      .get('/api/products/00000000-0000-0000-0000-000000000000')
      .expect(404);

    expect(res.body).toHaveProperty('error');
  });

  it('DELETE /api/products/:id should delete a product', async () => {
    await request(app)
      .delete(`/api/products/${createdProductId}`)
      .expect(204);
  });

  it('DELETE /api/products/:id should return 404 for already deleted product', async () => {
    await request(app)
      .delete(`/api/products/${createdProductId}`)
      .expect(404);
  });

  it('POST /api/products should reject invalid data', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ url: '', name: '', price: -1 })
      .expect(400);

    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('GET /api/health should return ok', async () => {
    const res = await request(app)
      .get('/api/health')
      .expect(200);

    expect(res.body.status).toBe('ok');
  });
});
