import { test, expect } from '@playwright/test';

test.describe('Onboarding Wizard E2E Tests (ATDD)', () => {
  test.skip('[P0] should display onboarding card with correct heading', async ({ page }) => {
    // User has completed sign-up, redirected to onboarding
    await page.goto('/onboarding');

    // Expect centered card with step indicator
    await expect(page.getByText('Step 1 of 3: Restaurant basics')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tell us about your restaurant' })).toBeVisible();
  });

  test.skip('[P0] should auto-generate slug from restaurant name', async ({ page }) => {
    await page.goto('/onboarding');

    // Type restaurant name
    const nameInput = page.getByRole('textbox', { name: /restaurant name/i });
    await nameInput.fill('The Blue Bistro');

    // Expect slug to be auto-generated
    const slugPreview = page.getByText(/your booking link/i);
    await expect(slugPreview).toBeVisible();
    await expect(slugPreview).toContainText('the-blue-bistro');
  });

  test.skip('[P0] should validate slug uniqueness in real-time', async ({ page }) => {
    await page.goto('/onboarding');

    // Enter name
    const nameInput = page.getByRole('textbox', { name: /restaurant name/i });
    await nameInput.fill('Existing Restaurant');

    // Enter a slug that already exists
    const slugInput = page.getByRole('textbox', { name: /slug/i });
    await slugInput.fill('existing-restaurant');

    // Expect availability indicator
    const availabilityIndicator = page.getByText(/slug is taken|slug is available/i);
    await expect(availabilityIndicator).toBeVisible();
  });

  test.skip('[P0] should advance to step 2 after valid submission', async ({ page }) => {
    await page.goto('/onboarding');

    // Fill form
    const nameInput = page.getByRole('textbox', { name: /restaurant name/i });
    await nameInput.fill('New Restaurant');

    const slugInput = page.getByRole('textbox', { name: /slug/i });
    await slugInput.fill('new-restaurant');

    // Click Continue
    const continueButton = page.getByRole('button', { name: /continue/i });
    await continueButton.click();

    // Expect wizard to advance to step 2
    await expect(page.getByText('Step 2 of 3')).toBeVisible();
  });

  test.skip('[P1] should show address field as optional', async ({ page }) => {
    await page.goto('/onboarding');

    // Expect address field with "(optional)" label
    const addressInput = page.getByRole('textbox', { name: /address.*optional/i });
    await expect(addressInput).toBeVisible();
  });

  test.skip('[P1] should allow skipping address field', async ({ page }) => {
    await page.goto('/onboarding');

    // Fill only required fields
    const nameInput = page.getByRole('textbox', { name: /restaurant name/i });
    await nameInput.fill('Restaurant Without Address');

    const slugInput = page.getByRole('textbox', { name: /slug/i });
    await slugInput.fill('restaurant-without-address');

    // Click Continue without entering address
    const continueButton = page.getByRole('button', { name: /continue/i });
    await continueButton.click();

    // Expect wizard to advance
    await expect(page.getByText('Step 2 of 3')).toBeVisible();
  });

  test.skip('[P0] should redirect to onboarding when not completed', async ({ page }) => {
    // User is authenticated but has no restaurant document
    await page.goto('/dashboard');

    // Expect redirect to onboarding
    await expect(page).toHaveURL('/onboarding');
    await expect(page.getByText('Step 1 of 3: Restaurant basics')).toBeVisible();
  });

  test.skip('[P0] should allow dashboard access after onboarding completed', async ({ page }) => {
    // User has completed onboarding (has restaurant document)
    await page.goto('/dashboard');

    // Expect dashboard to load (not redirected to onboarding)
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
