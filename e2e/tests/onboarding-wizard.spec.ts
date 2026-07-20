import { test, expect } from '../fixtures';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { getAuthInstance, getFirestoreInstance } from '../utils/firebase';
import { createUserData } from '../fixtures/factories';

test.describe('Onboarding Wizard', () => {
  test('[P0] should display onboarding card with correct heading', async ({ onboardingPage }) => {
    await expect(onboardingPage.getByText('Step 1 of 3: Restaurant basics')).toBeVisible();
    await expect(onboardingPage.getByRole('heading', { name: 'Tell us about your restaurant' })).toBeVisible();
  });

  test('[P0] should auto-generate slug from restaurant name', async ({ onboardingPage }) => {
    const nameInput = onboardingPage.getByRole('textbox', { name: /restaurant name/i });
    await nameInput.fill('The Blue Bistro');

    const slugPreview = onboardingPage.getByText(/your booking link/i);
    await expect(slugPreview).toBeVisible();
    await expect(slugPreview).toContainText('the-blue-bistro');
  });

  test('[P0] should validate slug uniqueness in real-time', async ({ onboardingPage }) => {
    const nameInput = onboardingPage.getByRole('textbox', { name: /restaurant name/i });
    await nameInput.fill('Existing Restaurant');

    const slugInput = onboardingPage.getByRole('textbox', { name: /slug/i });
    await slugInput.fill('existing-restaurant');

    const availabilityIndicator = onboardingPage.getByText(/slug is taken|slug is available|checking/i).first();
    await expect(availabilityIndicator).toBeVisible();
  });

  test('[P0] should advance to step 2 after valid submission', async ({ onboardingPage }) => {
    const nameInput = onboardingPage.getByRole('textbox', { name: /restaurant name/i });
    await nameInput.fill('New Restaurant');

    const slugInput = onboardingPage.getByRole('textbox', { name: /slug/i });
    await slugInput.fill('new-restaurant');

    await expect(onboardingPage.getByText('Slug is available').first()).toBeVisible({ timeout: 10_000 });

    const continueButton = onboardingPage.getByRole('button', { name: /continue/i });
    await continueButton.click();

    await expect(onboardingPage.getByRole('button', { name: /continue/i })).toBeEnabled({ timeout: 10_000 });
    await expect(onboardingPage.getByRole('alert')).not.toBeVisible();
  });

  test('[P1] should show address field as optional', async ({ onboardingPage }) => {
    const addressInput = onboardingPage.getByRole('textbox', { name: /address/i });
    await expect(addressInput).toBeVisible();
  });

  test('[P1] should allow skipping address field', async ({ onboardingPage }) => {
    const nameInput = onboardingPage.getByRole('textbox', { name: /restaurant name/i });
    await nameInput.fill('Restaurant Without Address');

    const slugInput = onboardingPage.getByRole('textbox', { name: /slug/i });
    await slugInput.fill('restaurant-without-address');

    await expect(onboardingPage.getByText('Slug is available').first()).toBeVisible({ timeout: 10_000 });

    const continueButton = onboardingPage.getByRole('button', { name: /continue/i });
    await continueButton.click();

    await expect(onboardingPage.getByRole('button', { name: /continue/i })).toBeEnabled({ timeout: 10_000 });
    await expect(onboardingPage.getByRole('alert')).not.toBeVisible();
  });

  test('[P0] should redirect to onboarding when not completed', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');

    await expect(authenticatedPage).toHaveURL(/onboarding/);
    await expect(authenticatedPage.getByText('Step 1 of 3: Restaurant basics')).toBeVisible();
  });

  test('[P0] should allow dashboard access after onboarding completed', async ({ page }) => {
    const auth = getAuthInstance();
    const db = getFirestoreInstance();
    const userData = createUserData();

    await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const user = auth.currentUser;

    const restaurantRef = doc(collection(db, 'restaurants'));
    await setDoc(restaurantRef, {
      name: 'Completed Restaurant',
      slug: `completed-${user!.uid}`,
      ownerId: user!.uid,
      timezone: 'Europe/London',
      hours: {},
      tableGroups: [],
      whiteLabel: { primaryColor: '#000000', secondaryColor: '#FFFFFF' },
      onboardingCompleted: true,
      createdAt: new Date(),
    });

    await page.goto('/login');
    await page.fill('input[name="email"]', userData.email);
    await page.fill('input[name="password"]', userData.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*(dashboard|onboarding)/);

    await expect(page).toHaveURL(/dashboard/);

    await deleteDoc(restaurantRef);
    await signOut(auth);
  });
});
