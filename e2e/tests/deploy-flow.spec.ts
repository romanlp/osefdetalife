import { test, expect } from '../fixtures';
import type { Page } from '@playwright/test';
import { getDoc } from 'firebase/firestore';

const SIDEBAR_ITEM_TEST_IDS = [
  'nav-item-bookings',
  'nav-item-info',
  'nav-item-hours',
  'nav-item-tables',
  'nav-item-branding',
  'nav-item-deploy',
  'nav-item-account',
];

async function signInAsOnboardedOwner(page: Page, userData: { email: string; password: string }): Promise<void> {
  await page.goto('/login');
  await page.fill('input[name="email"]', userData.email);
  await page.fill('input[name="password"]', userData.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/);
}

async function getRestaurantSlug(
  onboardedUser: { restaurantRef: import('firebase/firestore').DocumentReference },
): Promise<string> {
  const snapshot = await getDoc(onboardedUser.restaurantRef);
  const data = snapshot.data();
  if (!data?.slug) throw new Error(`Onboarded restaurant not found (slug missing)`);
  return data.slug as string;
}

async function goToDeployPage(page: Page): Promise<void> {
  await page.getByTestId('nav-item-deploy').click();
  await page.waitForURL(/\/dashboard\/deploy/);
}

test.describe('Deploy Flow', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test('[P0] onboarded owner signs in and lands on the dashboard with all 7 sidebar items', async ({
    page,
    onboardedUser,
  }) => {
    await signInAsOnboardedOwner(page, onboardedUser.userData);

    await expect(page).toHaveURL(/\/dashboard/);

    for (const testId of SIDEBAR_ITEM_TEST_IDS) {
      await expect(page.getByTestId(testId)).toBeVisible();
    }
  });

  test('[P0] Deploy page shows embed code with the restaurant slug and widget bundle', async ({
    page,
    onboardedUser,
  }) => {
    const slug = await getRestaurantSlug(onboardedUser);
    await signInAsOnboardedOwner(page, onboardedUser.userData);
    await goToDeployPage(page);

    const embed = page.getByTestId('embed-code');
    await expect(embed).toBeVisible();
    await expect(embed).toContainText('<script');
    await expect(embed).toContainText('booking-widget.mjs');
    await expect(embed).toContainText(`<booking-widget restaurant="${slug}"></booking-widget>`);
  });

  test('[P0] clicking the copy button shows the "Copied!" confirmation', async ({ page, onboardedUser }) => {
    await signInAsOnboardedOwner(page, onboardedUser.userData);
    await goToDeployPage(page);

    await page.getByTestId('copy-button').click();

    await expect(page.getByTestId('copied-message')).toHaveText('Copied!');
  });

  test('[P0] demo link opens in a new tab and carries the restaurant slug', async ({ page, onboardedUser }) => {
    const slug = await getRestaurantSlug(onboardedUser);
    await signInAsOnboardedOwner(page, onboardedUser.userData);
    await goToDeployPage(page);

    const demoLink = page.getByTestId('demo-link');
    await expect(demoLink).toBeVisible();
    await expect(demoLink).toHaveAttribute('href', new RegExp(`/assets/demo\\.html\\?slug=${slug}`));
    await expect(demoLink).toHaveAttribute('target', '_blank');
    await expect(demoLink).toHaveAttribute('rel', 'noopener');
  });

  test('[P1] demo page renders a booking-widget element for the restaurant slug', async ({ page, onboardedUser }) => {
    const slug = await getRestaurantSlug(onboardedUser);

    await page.goto(`/assets/demo.html?slug=${slug}`);

    await expect(page.locator('booking-widget')).toBeVisible({ timeout: 10_000 });
  });
});
