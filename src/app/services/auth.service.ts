import { Injectable, signal } from '@angular/core';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = getAuth();
  user = signal<User | null>(null);

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this.user.set(user);
    });
  }

  async signUpWithEmail(email: string, password: string): Promise<User> {
    const credential = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password,
    );
    await sendEmailVerification(credential.user);
    return credential.user;
  }

  async signInWithEmail(email: string, password: string): Promise<User> {
    const credential = await signInWithEmailAndPassword(
      this.auth,
      email,
      password,
    );
    return credential.user;
  }

  async signInWithGoogle(): Promise<User> {
    const credential = await signInWithPopup(this.auth, new GoogleAuthProvider());
    return credential.user;
  }

  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email);
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(this.auth);
  }

  async isFirstSignIn(): Promise<boolean> {
    const user = this.auth.currentUser;
    if (!user) return false;

    // Check if user metadata indicates first sign-in
    // This will be refined when we have restaurant document checking
    const creationTime = user.metadata.creationTime;
    const lastSignInTime = user.metadata.lastSignInTime;

    // If creation time equals last sign-in time, it's a first sign-in
    return creationTime === lastSignInTime;
  }
}
