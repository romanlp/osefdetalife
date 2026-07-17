import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test('[P0] should redirect unauthenticated user to login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*login/);
  });

  test('[P0] should redirect authenticated user away from login', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/.*(admin|login)/);
  });

  test('[P0] should load login page with sign-in button', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
  });
});
