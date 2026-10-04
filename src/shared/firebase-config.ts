import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import {environment} from '../environments/environment';

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length === 0 ? initializeApp(environment.firebase) : getApps()[0];
  }
  return app;
}

export function getFirebaseDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

let emulatorsConnected = false;

const LOOPBACK_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

export function isLoopbackHostname(hostname: string): boolean {
  return LOOPBACK_HOSTNAMES.has(hostname.trim().toLowerCase());
}

export function connectToEmulators(): void {
  if (emulatorsConnected) return;
  if (typeof window === 'undefined') return;

  const { hostname } = window.location;
  if (!isLoopbackHostname(hostname)) {
    console.error(
      `useEmulators is enabled but the page origin "${hostname}" is not a loopback address, so the ` +
        `emulator connection was skipped and this app is talking to the REAL Firebase project ` +
        `(${environment.firebase.projectId}). This silently breaks e2e runs and can write test data to ` +
        `production. Use a loopback origin, or turn off useEmulators if this is intentional.`,
    );
    return;
  }

  connectFirestoreEmulator(getFirebaseDb(), 'localhost', 8081);
  connectAuthEmulator(getFirebaseAuth(), 'http://localhost:9099');
  emulatorsConnected = true;
}
