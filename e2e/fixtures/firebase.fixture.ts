import { test as base } from '@playwright/test';
import { Firestore, collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestoreInstance, getAuthInstance } from '../utils/firebase';
import { clearFirestore, clearAuth } from '../utils/test-helpers';
import { createRestaurantData, createTableGroupData, createBookingData, createUserData } from './factories';
import type { Restaurant, TableGroup, Booking, User } from './types';

export interface FirebaseFixtures {
  db: Firestore;
  auth: Auth;
  cleanupFirestore: void;
  cleanupAuth: void;
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

  cleanupFirestore: [async ({}, use) => {
    await use();
    await clearFirestore();
  }, { auto: true }],

  cleanupAuth: [async ({}, use) => {
    await use();
    await clearAuth();
  }, { auto: true }],
});

export { expect } from '@playwright/test';
