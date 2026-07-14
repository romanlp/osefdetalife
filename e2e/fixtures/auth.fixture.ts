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
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', user.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
    
    await use(page);
  },
});

export { expect } from '@playwright/test';
