import { test, expect } from '@playwright/test';

test.describe('Application', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Roman Lapacherie/);
  });

  test('should have a root element', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('osef-root')).toBeAttached();
  });
});
