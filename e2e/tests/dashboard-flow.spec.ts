import { test, expect } from '@playwright/test';

test.describe('Dashboard Flow', () => {
  test('[P0] should redirect unauthenticated user from root to login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*login/);
  });

  test('[P0] should redirect unauthenticated user from dashboard to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/);
  });
});
