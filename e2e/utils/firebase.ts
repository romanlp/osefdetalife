import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'test-api-key',
  authDomain: 'demo-osefdetalife.firebaseapp.com',
  projectId: 'demo-osefdetalife',
  storageBucket: 'demo-osefdetalife.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abc123',
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirestoreInstance(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
    if (process.env['FIRESTORE_EMULATOR_HOST']) {
      connectFirestoreEmulator(db, 'localhost', 8081);
    }
  }
  return db;
}

export function getAuthInstance(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
    if (process.env['FIREBASE_AUTH_EMULATOR_HOST']) {
      connectAuthEmulator(auth, 'http://localhost:9099');
    }
  }
  return auth;
}
