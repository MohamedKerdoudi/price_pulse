import { describe, it, expect } from '@jest/globals';
import { calculatePriceChange, generatePriceVariation, createProductSchema } from '../../src/services/validation.js';

describe('calculatePriceChange', () => {
  it('should return "up" trend when price increased', () => {
    const result = calculatePriceChange(100, 120);
    expect(result.trend).toBe('up');
    expect(result.change).toBe(20);
    expect(result.changePercent).toBe(20);
  });

  it('should return "down" trend when price decreased', () => {
    const result = calculatePriceChange(100, 80);
    expect(result.trend).toBe('down');
    expect(result.change).toBe(-20);
    expect(result.changePercent).toBe(-20);
  });

  it('should return "stable" trend when price unchanged', () => {
    const result = calculatePriceChange(100, 100);
    expect(result.trend).toBe('stable');
    expect(result.change).toBe(0);
    expect(result.changePercent).toBe(0);
  });

  it('should handle zero initial price', () => {
    const result = calculatePriceChange(0, 100);
    expect(result.trend).toBe('up');
    expect(result.change).toBe(100);
    expect(result.changePercent).toBe(0);
  });

  it('should handle negative change correctly', () => {
    const result = calculatePriceChange(200, 150);
    expect(result.trend).toBe('down');
    expect(result.change).toBe(-50);
    expect(result.changePercent).toBe(-25);
  });
});

describe('generatePriceVariation', () => {
  it('should return a positive number', () => {
    const result = generatePriceVariation(100);
    expect(result).toBeGreaterThan(0);
  });

  it('should return a number close to the original price', () => {
    const result = generatePriceVariation(100);
    expect(result).toBeGreaterThan(50);
    expect(result).toBeLessThan(150);
  });

  it('should handle very small prices', () => {
    const result = generatePriceVariation(0.01);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(0.02);
  });

  it('should return a number with at most 2 decimal places', () => {
    for (let i = 0; i < 100; i++) {
      const result = generatePriceVariation(100);
      const decimalPart = (result * 100) % 1;
      expect(decimalPart).toBeCloseTo(0, 5);
    }
  });
});

describe('createProductSchema', () => {
  it('should accept valid product data', () => {
    const data = {
      url: 'https://example.com/product/123',
      name: 'Test Product',
      price: 29.99,
    };
    const result = createProductSchema.parse(data);
    expect(result.url).toBe(data.url);
    expect(result.name).toBe(data.name);
    expect(result.price).toBe(data.price);
    expect(result.currency).toBe('EUR');
  });

  it('should accept custom currency', () => {
    const data = {
      url: 'https://example.com/product/123',
      name: 'Test Product',
      price: 29.99,
      currency: 'USD',
    };
    const result = createProductSchema.parse(data);
    expect(result.currency).toBe('USD');
  });

  it('should reject empty URL', () => {
    const data = {
      url: '',
      name: 'Test',
      price: 10,
    };
    expect(() => createProductSchema.parse(data)).toThrow();
  });

  it('should reject invalid URL format', () => {
    const data = {
      url: 'not-a-valid-url',
      name: 'Test',
      price: 10,
    };
    expect(() => createProductSchema.parse(data)).toThrow();
  });

  it('should reject empty name', () => {
    const data = {
      url: 'https://example.com',
      name: '',
      price: 10,
    };
    expect(() => createProductSchema.parse(data)).toThrow();
  });

  it('should reject negative price', () => {
    const data = {
      url: 'https://example.com',
      name: 'Test',
      price: -5,
    };
    expect(() => createProductSchema.parse(data)).toThrow();
  });

  it('should reject zero price', () => {
    const data = {
      url: 'https://example.com',
      name: 'Test',
      price: 0,
    };
    expect(() => createProductSchema.parse(data)).toThrow();
  });

  it('should reject non-numeric price', () => {
    const data = {
      url: 'https://example.com',
      name: 'Test',
      price: 'not-a-number',
    };
    expect(() => createProductSchema.parse(data)).toThrow();
  });
});
