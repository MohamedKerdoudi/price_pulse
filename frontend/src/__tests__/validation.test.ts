import { describe, it, expect } from '@jest/globals';

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidPrice(price: number): boolean {
  return typeof price === 'number' && !isNaN(price) && price > 0 && price <= 999999999.99;
}

function isValidProductName(name: string): boolean {
  return typeof name === 'string' && name.trim().length >= 1 && name.trim().length <= 255;
}

describe('Frontend Validation', () => {
  describe('isValidUrl', () => {
    it('should accept valid https URLs', () => {
      expect(isValidUrl('https://example.com/product/123')).toBe(true);
    });

    it('should accept valid http URLs', () => {
      expect(isValidUrl('http://example.com/product')).toBe(true);
    });

    it('should reject empty string', () => {
      expect(isValidUrl('')).toBe(false);
    });

    it('should reject invalid URL strings', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
    });

    it('should reject ftp protocol', () => {
      expect(isValidUrl('ftp://example.com')).toBe(false);
    });
  });

  describe('isValidPrice', () => {
    it('should accept valid positive numbers', () => {
      expect(isValidPrice(29.99)).toBe(true);
    });

    it('should reject zero', () => {
      expect(isValidPrice(0)).toBe(false);
    });

    it('should reject negative numbers', () => {
      expect(isValidPrice(-10)).toBe(false);
    });

    it('should reject NaN', () => {
      expect(isValidPrice(NaN)).toBe(false);
    });
  });

  describe('isValidProductName', () => {
    it('should accept valid product names', () => {
      expect(isValidProductName('Samsung Galaxy S24')).toBe(true);
    });

    it('should reject empty string', () => {
      expect(isValidProductName('')).toBe(false);
    });

    it('should reject whitespace-only strings', () => {
      expect(isValidProductName('   ')).toBe(false);
    });

    it('should reject names longer than 255 characters', () => {
      expect(isValidProductName('a'.repeat(256))).toBe(false);
    });
  });
});