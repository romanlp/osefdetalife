import { test, expect } from '../fixtures';
import type { Page } from '@playwright/test';

const SIDEBAR_ITEM_LABELS = [
  'Bookings',
  'Info',
  'Hours',
  'Tables',
  'Branding',
  'Booking Link',
  'Account',
];

async function signInAsOnboardedOwner(page: Page, userData: { email: string; password: string }): Promise<void> {
  await page.goto('/login');
  await page.fill('input[name="email"]', userData.email);
  await page.fill('input[name="password"]', userData.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/);
}

test.describe('Dashboard Flow', () => {
  test('[P0] should redirect unauthenticated user from root to login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*login/);
  });

  test('[P0] should redirect unauthenticated user from dashboard to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/);
  });

  test('[P0] signed-in owner signs out from the sidebar and lands on login', async ({ page, onboardedUser }) => {
    await signInAsOnboardedOwner(page, onboardedUser.userData);

    await page.getByTestId('sign-out-button').click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('[P1] wide sidebar is 240px with visible labels', async ({ page, onboardedUser }) => {
    await signInAsOnboardedOwner(page, onboardedUser.userData);

    const sidebar = page.locator('osef-dashboard-sidebar');
    await expect(sidebar).toBeVisible();
    const box = await sidebar.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeCloseTo(240, 0);
    await expect(page.getByText('Osefdetalife', { exact: true })).toBeVisible();
    await expect(page.getByTestId('nav-item-booking-link').getByText('Booking Link')).toBeVisible();
  });

  test.describe('narrow viewport', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('[P0] sidebar collapses to a 64px icon rail with every item still named', async ({ page, onboardedUser }) => {
      await signInAsOnboardedOwner(page, onboardedUser.userData);

      const sidebar = page.locator('osef-dashboard-sidebar');
      await expect(sidebar).toBeVisible();
      const sidebarBox = await sidebar.boundingBox();
      expect(sidebarBox).not.toBeNull();
      expect(sidebarBox!.width).toBeCloseTo(64, 0);

      const mainBox = await page.locator('main').boundingBox();
      expect(mainBox).not.toBeNull();
      expect(mainBox!.width).toBeCloseTo(375 - 64, 0);

      await expect(page.getByText('Osefdetalife', { exact: true })).toBeHidden();

      for (const label of SIDEBAR_ITEM_LABELS) {
        const link = page.getByRole('link', { name: label, exact: true });
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute('title', label);
        await expect(link.getByText(label, { exact: true })).toBeHidden();
        await expect(link.locator('mat-icon')).toBeVisible();
      }

      // The Auth emulator's fixed banner overlays the sidebar foot at this height; it never ships.
      await page.addStyleTag({ content: '.firebase-emulator-warning { display: none !important; }' });
      const signOut = page.getByRole('button', { name: 'Sign out' });
      await expect(signOut).toBeVisible();
      await signOut.click();
      await expect(page).toHaveURL(/\/login/);
    });
  });
});
