import { test, expect } from '@playwright/test';

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5174';

test.describe('PricePulse E2E', () => {
  test('user can add a product and see it in the dashboard', async ({ page }) => {
    const apiBase = 'http://localhost:3001';
    const response = await page.request.get(`${apiBase}/api/products?limit=100`);
    const body = await response.json();
    if (body.data) {
      for (const product of body.data) {
        await page.request.delete(`${apiBase}/api/products/${product.id}`);
      }
    }

    await page.goto(BASE_URL);

    await expect(page.locator('h1')).toContainText('PricePulse');

    const urlInput = page.locator('input[type="url"]');
    const nameInput = page.locator('input#name');
    const priceInput = page.locator('input[type="number"]');
    const submitButton = page.locator('button[type="submit"]');

    await urlInput.fill('https://example.com/product/123');
    await nameInput.fill('E2E Test Product');
    await priceInput.fill('99.99');

    await submitButton.click();

    await expect(page.locator('h3:text("E2E Test Product")').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.price-value').first()).toBeVisible();
  });
});
