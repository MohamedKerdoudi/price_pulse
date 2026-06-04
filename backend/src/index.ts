import express from 'express';
import cors from 'cors';
import productRoutes from './routes/products.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { startPriceSimulator } from './services/priceSimulator.js';
import pool, { query } from './config/database.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/products', productRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function start(): Promise<void> {
  try {
    await pool.query('SELECT 1');
    console.log('Connected to PostgreSQL');

    await query(`
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
      CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
      CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON price_history(product_id);
      CREATE INDEX IF NOT EXISTS idx_price_history_recorded_at ON price_history(recorded_at);
    `);
    console.log('Database schema ready');

    startPriceSimulator();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  start();
}

export default app;
