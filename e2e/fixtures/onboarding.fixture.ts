import { test as base } from '@playwright/test';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { Firestore, collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { getAuthInstance } from '../utils/firebase';
import { createUserData } from './factories';
import type { User } from './types';
import type { FirebaseFixtures } from './firebase.fixture';

export interface OnboardingFixtures {
  newUser: User;
  onboardedUser: { userData: User; restaurantRef: ReturnType<typeof doc> };
  onboardingPage: import('@playwright/test').Page;
}

export const test = base.extend<OnboardingFixtures & FirebaseFixtures>({
  newUser: async ({}, use) => {
    const userData = createUserData();
    const auth = getAuthInstance();

    await createUserWithEmailAndPassword(auth, userData.email, userData.password);

    await use(userData);

    await signOut(auth);
  },

  onboardedUser: async ({ auth, db }, use) => {
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

    await use({ userData, restaurantRef });

    await deleteDoc(restaurantRef);
    await signOut(auth);
  },

  onboardingPage: async ({ page, newUser }, use) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', newUser.email);
    await page.fill('input[name="password"]', newUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(onboarding|dashboard)/);

    const url = page.url();
    if (url.includes('/dashboard')) {
      await page.goto('/onboarding');
    }

    await use(page);
  },
});

export { expect } from '@playwright/test';
