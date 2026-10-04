import { test as base } from '@playwright/test';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { getFirestoreInstance, getAuthInstance } from '../utils/firebase';

export interface FirebaseFixtures {
  db: Firestore;
  auth: Auth;
}

export const test = base.extend<FirebaseFixtures>({
  db: [async ({}, use) => {
    const db = getFirestoreInstance();
    await use(db);
  }, { auto: false }],

  auth: [async ({}, use) => {
    const auth = getAuthInstance();
    await use(auth);
  }, { auto: false }],
});

export { expect } from '@playwright/test';
