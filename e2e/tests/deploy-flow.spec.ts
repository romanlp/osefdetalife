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

  test('[P0] Deploy page shows booking link with the restaurant slug', async ({
    page,
    onboardedUser,
  }) => {
    const slug = await getRestaurantSlug(onboardedUser);
    await signInAsOnboardedOwner(page, onboardedUser.userData);
    await goToDeployPage(page);

    const bookingLink = page.getByTestId('booking-link');
    await expect(bookingLink).toBeVisible();
    await expect(bookingLink).toHaveValue(new RegExp(`/book/${slug}$`));
  });

  test('[P0] Deploy page shows QR code for the booking link', async ({
    page,
    onboardedUser,
  }) => {
    await signInAsOnboardedOwner(page, onboardedUser.userData);
    await goToDeployPage(page);

    const qrImg = page.locator('img[alt="QR code for your booking link"]');
    await expect(qrImg).toBeVisible();
    await expect(qrImg).toHaveAttribute('src', /api\.qrserver\.com/);
  });

  test('[P0] clicking the copy button shows the "Copied!" confirmation', async ({ page, onboardedUser }) => {
    await signInAsOnboardedOwner(page, onboardedUser.userData);
    await goToDeployPage(page);

    await page.getByTestId('copy-button').click();

    await expect(page.getByTestId('copied-message')).toHaveText('Copied!');
  });

  test('[P0] preview button opens booking page in new tab', async ({ page, onboardedUser }) => {
    const slug = await getRestaurantSlug(onboardedUser);
    await signInAsOnboardedOwner(page, onboardedUser.userData);
    await goToDeployPage(page);

    const previewBtn = page.getByTestId('preview-button');
    await expect(previewBtn).toBeVisible();
    await expect(previewBtn).toHaveText('Preview booking page');

    const [newPage] = await Promise.all([
      page.waitForEvent('popup'),
      previewBtn.click(),
    ]);
    await expect(newPage).toHaveURL(new RegExp(`/book/${slug}`));
  });
});