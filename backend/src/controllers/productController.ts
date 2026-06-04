import { Request, Response, NextFunction } from 'express';
import { query, queryOne } from '../config/database.js';
import { createProductSchema, calculatePriceChange } from '../services/validation.js';
import { AppError } from '../middleware/errorHandler.js';
import { Product, ProductResponse, PaginatedResponse } from '../types/index.js';

function mapProductToResponse(product: Product): ProductResponse {
  const initialPrice = Number(product.initial_price);
  const currentPrice = Number(product.current_price);
  
  const { change, changePercent, trend } = calculatePriceChange(
    initialPrice,
    currentPrice
  );

  return {
    id: product.id,
    url: product.url,
    name: product.name,
    initialPrice,
    currentPrice,
    currency: product.currency,
    priceChange: change,
    priceChangePercent: changePercent,
    trend,
    isActive: product.is_active,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  };
}

export async function getProducts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const isActive = req.query.isActive !== 'false';
    const offset = (page - 1) * limit;

    const countResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM products WHERE is_active = $1',
      [isActive]
    );
    const total = parseInt(countResult?.count || '0');

    const products = await query<Product>(
      'SELECT * FROM products WHERE is_active = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [isActive, limit, offset]
    );

    const response: PaginatedResponse<ProductResponse> = {
      data: products.map(mapProductToResponse),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

export async function createProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = createProductSchema.parse(req.body);

    const product = await queryOne<Product>(
      `INSERT INTO products (url, name, initial_price, current_price, currency)
       VALUES ($1, $2, $3, $3, $4)
       RETURNING *`,
      [data.url, data.name, data.price, data.currency || 'EUR']
    );

    if (!product) {
      throw new AppError(500, 'Failed to create product');
    }

    await query(
      'INSERT INTO price_history (product_id, price) VALUES ($1, $2)',
      [product.id, data.price]
    );

    res.status(201).json(mapProductToResponse(product));
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const product = await queryOne<Product>(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );

    if (!product) {
      throw new AppError(404, 'Product not found');
    }

    await query('DELETE FROM products WHERE id = $1', [id]);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function getProductById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const product = await queryOne<Product>(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );

    if (!product) {
      throw new AppError(404, 'Product not found');
    }

    res.json(mapProductToResponse(product));
  } catch (error) {
    next(error);
  }
}

export async function getPriceHistory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const product = await queryOne<Product>(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );

    if (!product) {
      throw new AppError(404, 'Product not found');
    }

    const history = await query(
      'SELECT price, recorded_at FROM price_history WHERE product_id = $1 ORDER BY recorded_at ASC',
      [id]
    );

    res.json({ productId: id, history });
  } catch (error) {
    next(error);
  }
}
