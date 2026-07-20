import { test as base } from '@playwright/test';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getAuthInstance } from '../utils/firebase';
import { createUserData } from './factories';
import type { User } from './types';

export interface AuthFixtures {
  user: User;
  authenticatedPage: import('@playwright/test').Page;
}

export const test = base.extend<AuthFixtures>({
  user: async ({}, use) => {
    const userData = createUserData();
    const auth = getAuthInstance();
    
    await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    
    await use(userData);
    
    await signOut(auth);
  },

  authenticatedPage: async ({ page, user }, use) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|onboarding)/);
    
    await use(page);
  },
});

export { expect } from '@playwright/test';
