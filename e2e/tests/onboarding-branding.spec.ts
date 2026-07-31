import { test, expect } from '../fixtures';
import type { Page } from '@playwright/test';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

const DEFAULT_PRIMARY = '#1A1A1A';
const DEFAULT_SECONDARY = '#8FA67A';

async function completeStepsOneAndTwo(page: Page, slug: string): Promise<void> {
  await page.getByRole('textbox', { name: /restaurant name/i }).fill('Branding Test Restaurant');

  const slugInput = page.getByRole('textbox', { name: /slug/i });
  await slugInput.fill(slug);

  await expect(page.getByText('Slug is available').first()).toBeVisible({ timeout: 10_000 });

  const continueButton = page.getByRole('button', { name: /continue/i });
  await continueButton.click();

  await page.getByRole('checkbox', { name: /toggle monday/i }).check();
  await page.getByTestId('add-table-group').click();

  const stepTwoContinue = page.getByRole('button', { name: /continue/i });
  await expect(stepTwoContinue).toBeEnabled({ timeout: 10_000 });
  await stepTwoContinue.click();
}

async function getRestaurantBySlug(db: Firestore, slug: string) {
  const snapshot = await getDocs(query(collection(db, 'restaurants'), where('slug', '==', slug)));
  if (snapshot.empty) throw new Error(`Restaurant with slug "${slug}" not found in Firestore`);
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

test.describe('Onboarding Branding Step', () => {
  test.skip('[P0] step 3 loads with step indicator, heading and skip link', async ({ onboardingPage }) => {
    await completeStepsOneAndTwo(onboardingPage, 'branding-loads-test');

    await expect(onboardingPage.getByText('Step 3 of 3: Branding')).toBeVisible();
    await expect(onboardingPage.getByRole('heading', { name: 'Style your booking widget' })).toBeVisible();

    const skipLink = onboardingPage.getByTestId('skip-link');
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toHaveAccessibleName('Skip');
  });

  test.skip('[P0] color pickers are pre-filled with sensible defaults', async ({ onboardingPage }) => {
    await completeStepsOneAndTwo(onboardingPage, 'branding-defaults-test');

    const primarySwatch = onboardingPage.getByTestId('color-primary');
    const secondarySwatch = onboardingPage.getByTestId('color-secondary');

    await expect(primarySwatch).toBeVisible();
    await expect(secondarySwatch).toBeVisible();
    await expect(primarySwatch).toHaveAccessibleName('Primary color');
    await expect(secondarySwatch).toHaveAccessibleName('Secondary color');

    await expect(onboardingPage.getByTestId('hex-primary')).toHaveValue(DEFAULT_PRIMARY);
    await expect(onboardingPage.getByTestId('hex-secondary')).toHaveValue(DEFAULT_SECONDARY);
    await expect(primarySwatch).toHaveValue(DEFAULT_PRIMARY.toLowerCase());
    await expect(secondarySwatch).toHaveValue(DEFAULT_SECONDARY.toLowerCase());
  });

  test.skip('[P0] complete flow saves branding data and marks onboarding complete', async ({ onboardingPage, db }) => {
    const slug = 'branding-complete-test';
    await completeStepsOneAndTwo(onboardingPage, slug);

    await onboardingPage.getByTestId('hex-primary').fill('#123456');
    await onboardingPage.getByTestId('hex-secondary').fill('#ABCDEF');

    await onboardingPage.getByTestId('custom-field-label').fill('Party size');
    await onboardingPage.getByTestId('custom-field-required').click();

    await onboardingPage.getByRole('button', { name: 'Complete' }).click();
    await onboardingPage.waitForURL(/dashboard/);
    await expect(onboardingPage).toHaveURL(/dashboard/);

    const restaurant = await getRestaurantBySlug(db, slug);
    expect(restaurant.onboardingCompleted).toBe(true);
    expect(restaurant.whiteLabel).toEqual({ primaryColor: '#123456', secondaryColor: '#ABCDEF' });
    expect(restaurant.customField).toEqual({ label: 'Party size', required: true, enabled: false });
  });

  test.skip('[P0] skip flow completes onboarding without saving branding changes', async ({ onboardingPage, db }) => {
    const slug = 'branding-skip-test';
    await completeStepsOneAndTwo(onboardingPage, slug);

    await onboardingPage.getByTestId('skip-link').click();
    await onboardingPage.waitForURL(/dashboard/);
    await expect(onboardingPage).toHaveURL(/dashboard/);

    const restaurant = await getRestaurantBySlug(db, slug);
    expect(restaurant.onboardingCompleted).toBe(true);
    expect(restaurant.customField).toBeUndefined();
    expect(restaurant.whiteLabel).toEqual({ primaryColor: DEFAULT_PRIMARY, secondaryColor: DEFAULT_SECONDARY });
  });

  test.skip('[P1] custom field defaults to disabled with required off', async ({ onboardingPage }) => {
    await completeStepsOneAndTwo(onboardingPage, 'branding-customfield-defaults-test');

    await expect(onboardingPage.getByTestId('custom-field-label')).toBeVisible();
    await expect(onboardingPage.getByTestId('custom-field-required')).not.toBeChecked();
    await expect(onboardingPage.getByTestId('custom-field-enabled')).not.toBeChecked();
  });

  test.skip('[P1] invalid hex shows an error and disables complete', async ({ onboardingPage }) => {
    await completeStepsOneAndTwo(onboardingPage, 'branding-invalid-hex-test');

    await onboardingPage.getByTestId('hex-primary').fill('#GGGGGG');

    const alert = onboardingPage.getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/invalid|hex|color format/i);

    await expect(onboardingPage.getByRole('button', { name: 'Complete' })).toBeDisabled();
  });

  test.skip('[P2] hex text input and color swatch stay in sync', async ({ onboardingPage }) => {
    await completeStepsOneAndTwo(onboardingPage, 'branding-sync-test');

    await onboardingPage.getByTestId('hex-primary').fill('#345678');

    await expect(onboardingPage.getByTestId('hex-primary')).toHaveValue('#345678');
    await expect(onboardingPage.getByTestId('color-primary')).toHaveValue('#345678');
  });
});
