import { test, expect } from '@playwright/test';

test.describe('Dashboard Flow', () => {
  test('[P0] should load dashboard from root path', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('[P0] should load dashboard directly', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('h1, h2, h3, [class*="heading"]')).toBeVisible();
  });

  test('[P0] should show dashboard heading text', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
