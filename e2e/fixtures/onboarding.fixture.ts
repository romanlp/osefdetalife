import { test as base } from '@playwright/test';
import { Auth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getAuthInstance } from '../utils/firebase';
import { createUserData } from './factories';
import type { User } from './types';

export interface OnboardingFixtures {
  onboardedUser: User;
  onboardingPage: import('@playwright/test').Page;
}

export const test = base.extend<OnboardingFixtures>({
  onboardedUser: async ({}, use) => {
    const userData = createUserData();
    const auth = getAuthInstance();

    await createUserWithEmailAndPassword(auth, userData.email, userData.password);

    await use(userData);

    await signOut(auth);
  },

  onboardingPage: async ({ page, onboardedUser }, use) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', onboardedUser.email);
    await page.fill('[data-testid="password-input"]', onboardedUser.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/.*(onboarding|dashboard)/);

    const url = page.url();
    if (url.includes('/dashboard')) {
      await page.goto('/onboarding');
    }

    await use(page);
  },
});

export { expect } from '@playwright/test';
