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

export function connectToEmulators(): void {
  if (emulatorsConnected) return;
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    connectFirestoreEmulator(getFirebaseDb(), 'localhost', 8081);
    connectAuthEmulator(getFirebaseAuth(), 'http://localhost:9099');
    emulatorsConnected = true;
  }
}
