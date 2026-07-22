import { test, expect } from '@playwright/test';

test.describe('Onboarding Availability Step E2E (ATDD)', () => {
  test.skip('[P0] should display step indicator and heading', async ({ page }) => {
    // THIS TEST WILL FAIL - UI not implemented yet
    await page.goto('/onboarding/availability');

    await expect(page.getByText('Step 2 of 3: Availability')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'When are you open?' })).toBeVisible();
  });

  test('[P0] should display weekly schedule with open/closed toggles', async ({ page }) => {
    // THIS TEST WILL FAIL - UI not implemented yet
    await page.goto('/onboarding/availability');

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    for (const day of days) {
      await expect(page.getByText(day)).toBeVisible();
      await expect(page.getByRole('checkbox', { name: `Toggle ${day}` })).toBeVisible();
    }
  });

  test('[P0] should show time inputs when day is toggled open', async ({ page }) => {
    // THIS TEST WILL FAIL - UI not implemented yet
    await page.goto('/onboarding/availability');

    await page.getByRole('checkbox', { name: 'Toggle Monday' }).check();

    await expect(page.getByLabel('Monday open time')).toBeVisible();
    await expect(page.getByLabel('Monday close time')).toBeVisible();
  });

  test('[P1] should hide time inputs when day is toggled closed', async ({ page }) => {
    // THIS TEST WILL FAIL - UI not implemented yet
    await page.goto('/onboarding/availability');

    await page.getByRole('checkbox', { name: 'Toggle Monday' }).check();
    await page.getByRole('checkbox', { name: 'Toggle Monday' }).uncheck();

    await expect(page.getByLabel('Monday open time')).not.toBeVisible();
    await expect(page.getByLabel('Monday close time')).not.toBeVisible();
  });

  test('[P1] should disable continue button when all days are closed', async ({ page }) => {
    // THIS TEST WILL FAIL - UI not implemented yet
    await page.goto('/onboarding/availability');

    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled();
    await expect(page.getByText('Set your opening hours to continue')).toBeVisible();
  });

  test('[P0] should add table group row', async ({ page }) => {
    // THIS TEST WILL FAIL - UI not implemented yet
    await page.goto('/onboarding/availability');

    await page.getByRole('button', { name: 'Add Table Group' }).click();

    await expect(page.getByLabel('Table capacity')).toBeVisible();
    await expect(page.getByLabel('Number of tables')).toBeVisible();
  });

  test('[P1] should add multiple table groups', async ({ page }) => {
    // THIS TEST WILL FAIL - UI not implemented yet
    await page.goto('/onboarding/availability');

    await page.getByRole('button', { name: 'Add Table Group' }).click();
    await page.getByRole('button', { name: 'Add Table Group' }).click();

    const capacityInputs = page.getByLabel('Table capacity');
    await expect(capacityInputs).toHaveCount(2);
  });

  test('[P1] should disable continue button when no table groups', async ({ page }) => {
    // THIS TEST WILL FAIL - UI not implemented yet
    await page.goto('/onboarding/availability');

    // Toggle at least one day open
    await page.getByRole('checkbox', { name: 'Toggle Monday' }).check();

    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled();
    await expect(page.getByText('Add at least one table group to continue')).toBeVisible();
  });

  test('[P0] should save data and navigate to step 3', async ({ page }) => {
    // THIS TEST WILL FAIL - UI not implemented yet
    await page.goto('/onboarding/availability');

    // Toggle Monday open
    await page.getByRole('checkbox', { name: 'Toggle Monday' }).check();
    await page.getByLabel('Monday open time').fill('09:00');
    await page.getByLabel('Monday close time').fill('17:00');

    // Add table group
    await page.getByRole('button', { name: 'Add Table Group' }).click();
    await page.getByLabel('Table capacity').fill('4');
    await page.getByLabel('Number of tables').fill('2');

    // Click Continue
    await page.getByRole('button', { name: 'Continue' }).click();

    // Expect navigation to step 3
    await expect(page).toHaveURL('/onboarding/branding');
  });
});
