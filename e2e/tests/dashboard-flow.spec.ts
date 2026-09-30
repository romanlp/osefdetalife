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

    const sidebar = page.locator('mat-sidenav');
    await expect(sidebar).toBeVisible();
    const box = await sidebar.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeCloseTo(240, 0);
    await expect(page.getByRole('button', { name: 'Open navigation' })).toHaveCount(0);
    await expect(page.getByText('Osefdetalife', { exact: true })).toBeVisible();
    await expect(page.getByTestId('nav-item-booking-link').getByText('Booking Link')).toBeVisible();
  });

  test.describe('narrow viewport', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('[P0] sidebar is hidden behind a menu button and content spans the full width', async ({ page, onboardedUser }) => {
      await signInAsOnboardedOwner(page, onboardedUser.userData);

      const menuButton = page.getByRole('button', { name: 'Open navigation' });
      await expect(menuButton).toBeVisible();
      await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator('osef-dashboard-sidebar')).toBeHidden();

      const mainBox = await page.locator('main').boundingBox();
      expect(mainBox).not.toBeNull();
      expect(mainBox!.width).toBeCloseTo(375, 0);
    });

    test('[P0] drawer opens over the content and closes on item, Esc and scrim with focus back on the menu button', async ({ page, onboardedUser }) => {
      await signInAsOnboardedOwner(page, onboardedUser.userData);
      const menuButton = page.getByRole('button', { name: 'Open navigation' });
      const sidebar = page.locator('osef-dashboard-sidebar');
      // The drawer records the element to restore focus to once its open transition ends,
      // which is also when it moves focus inside; wait for that before closing it.
      const openDrawer = async (): Promise<void> => {
        await menuButton.click();
        await expect(sidebar).toBeVisible();
        await expect(page.locator('mat-sidenav').locator(':focus')).toHaveCount(1);
      };

      await openDrawer();
      await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
      const drawerBox = await page.locator('mat-sidenav').boundingBox();
      expect(drawerBox!.width).toBeCloseTo(240, 0);
      for (const label of SIDEBAR_ITEM_LABELS) {
        await expect(page.getByRole('link', { name: label, exact: true })).toBeVisible();
      }

      await page.getByRole('link', { name: 'Booking Link', exact: true }).click();
      await expect(page).toHaveURL(/\/dashboard\/booking-link/);
      await expect(sidebar).toBeHidden();
      await expect(menuButton).toBeFocused();

      await openDrawer();
      await page.keyboard.press('Escape');
      await expect(sidebar).toBeHidden();
      await expect(menuButton).toBeFocused();
      await expect(menuButton).toHaveAttribute('aria-expanded', 'false');

      await openDrawer();
      await page.locator('.mat-drawer-backdrop').click({ position: { x: 360, y: 400 } });
      await expect(sidebar).toBeHidden();
      await expect(menuButton).toBeFocused();
    });

    test('[P0] keyboard focus stays inside the open drawer', async ({ page, onboardedUser }) => {
      await signInAsOnboardedOwner(page, onboardedUser.userData);
      const menuButton = page.getByRole('button', { name: 'Open navigation' });

      await menuButton.focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('mat-sidenav').locator(':focus')).toHaveCount(1);

      for (let i = 0; i < SIDEBAR_ITEM_LABELS.length + 2; i++) {
        await page.keyboard.press('Tab');
        await expect(page.locator('mat-sidenav').locator(':focus')).toHaveCount(1);
      }
    });

    test('[P1] widening with the drawer open switches to the side sidebar', async ({ page, onboardedUser }) => {
      await signInAsOnboardedOwner(page, onboardedUser.userData);
      await page.getByRole('button', { name: 'Open navigation' }).click();
      await expect(page.locator('osef-dashboard-sidebar')).toBeVisible();

      await page.setViewportSize({ width: 1024, height: 812 });

      await expect(page.getByRole('button', { name: 'Open navigation' })).toHaveCount(0);
      await expect(page.locator('osef-dashboard-sidebar')).toBeVisible();
      await expect(page.locator('.mat-drawer-backdrop.mat-drawer-shown')).toHaveCount(0);
      const mainBox = await page.locator('main').boundingBox();
      expect(mainBox!.width).toBeCloseTo(1024 - 240, 0);
    });

    test('[P0] owner signs out from the open drawer', async ({ page, onboardedUser }) => {
      await signInAsOnboardedOwner(page, onboardedUser.userData);
      // The Auth emulator's fixed banner overlays the drawer foot at this height; it never ships.
      await page.addStyleTag({ content: '.firebase-emulator-warning { display: none !important; }' });

      await page.getByRole('button', { name: 'Open navigation' }).click();
      const signOut = page.getByRole('button', { name: 'Sign out' });
      await expect(signOut).toBeVisible();
      await signOut.click();
      await expect(page).toHaveURL(/\/login/);
    });
  });
});
