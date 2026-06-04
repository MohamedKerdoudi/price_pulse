import { z } from 'zod';

const urlRegex = /^https?:\/\/.+\..+/i;

export const createProductSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .max(2048, 'URL must be at most 2048 characters')
    .refine((val) => urlRegex.test(val), {
      message: 'Invalid URL format. Must start with http:// or https://',
    }),
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(255, 'Product name must be at most 255 characters'),
  price: z
    .number()
    .positive('Price must be a positive number')
    .max(999999999.99, 'Price is too high'),
  currency: z
    .string()
    .length(3, 'Currency must be a 3-letter code')
    .default('EUR'),
});

export function calculatePriceChange(
  initialPrice: number,
  currentPrice: number
): { change: number; changePercent: number; trend: 'up' | 'down' | 'stable' } {
  const change = Number((currentPrice - initialPrice).toFixed(2));
  const changePercent =
    initialPrice > 0
      ? Number((((currentPrice - initialPrice) / initialPrice) * 100).toFixed(2))
      : 0;

  let trend: 'up' | 'down' | 'stable';
  if (change > 0) {
    trend = 'up';
  } else if (change < 0) {
    trend = 'down';
  } else {
    trend = 'stable';
  }

  return { change, changePercent, trend };
}

export function generatePriceVariation(currentPrice: number): number {
  const price = Number(currentPrice);
  const variationPercent = (Math.random() - 0.5) * 10;
  const variation = price * (variationPercent / 100);
  const newPrice = Number((price + variation).toFixed(2));
  return Math.max(0.01, newPrice);
}
