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

    const creationTime = user.metadata.creationTime;
    const lastSignInTime = user.metadata.lastSignInTime;

    if (!creationTime || !lastSignInTime) return false;

    return creationTime === lastSignInTime;
  }

  getErrorMessage(code: string | undefined): string {
    if (!code) return 'An error occurred. Please try again';

    switch (code) {
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed';
      case 'auth/popup-blocked-by-user':
        return 'Popup was blocked by your browser. Please allow popups and try again';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/weak-password':
        return 'Password is too weak';
      default:
        return 'An error occurred. Please try again';
    }
  }
}
