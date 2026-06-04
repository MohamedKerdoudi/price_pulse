import { query } from '../config/database.js';
import { generatePriceVariation } from './validation.js';
import { Product, PriceHistory } from '../types/index.js';

const SIMULATION_INTERVAL_MS = 30000;

let intervalId: ReturnType<typeof setInterval> | null = null;

async function simulatePriceUpdate(): Promise<void> {
  try {
    const products = await query<Product>(
      "SELECT * FROM products WHERE is_active IS NOT FALSE"
    );

    for (const product of products) {
      const newPrice = generatePriceVariation(product.current_price);

      await query(
        "UPDATE products SET current_price = $1, updated_at = NOW() WHERE id = $2",
        [newPrice, product.id]
      );

      await query(
        "INSERT INTO price_history (product_id, price) VALUES ($1, $2)",
        [product.id, newPrice]
      );
    }

    if (products.length > 0) {
      console.log(
        `[PriceSimulator] Updated prices for ${products.length} product(s) at ${new Date().toISOString()}`
      );
    }
  } catch (error) {
    console.error('[PriceSimulator] Error updating prices:', error);
  }
}

export function startPriceSimulator(): void {
  if (intervalId) {
    console.log('[PriceSimulator] Already running');
    return;
  }

  console.log(
    `[PriceSimulator] Starting with interval of ${SIMULATION_INTERVAL_MS}ms`
  );
  simulatePriceUpdate();
  intervalId = setInterval(simulatePriceUpdate, SIMULATION_INTERVAL_MS);
}

export function stopPriceSimulator(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[PriceSimulator] Stopped');
  }
}
