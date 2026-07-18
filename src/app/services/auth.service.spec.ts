import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut as firebaseSignOut,
} from 'firebase/auth';

vi.mock('firebase/auth', () => {
  const mockAuth = {
    currentUser: null,
  };

  return {
    getAuth: vi.fn(() => mockAuth),
    onAuthStateChanged: vi.fn((auth, callback) => {
      callback(null);
      return vi.fn();
    }),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signInWithPopup: vi.fn(),
    GoogleAuthProvider: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    sendEmailVerification: vi.fn(),
    signOut: vi.fn(),
  };
});

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have user signal initialized to null', () => {
    expect(service.user).toBeDefined();
    expect(service.user()).toBeNull();
  });

  describe('signUpWithEmail', () => {
    it('should create user and send verification email', async () => {
      const mockUser = { uid: '123', email: 'test@example.com' };
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({ user: mockUser } as any);
      vi.mocked(sendEmailVerification).mockResolvedValue(undefined);

      const result = await service.signUpWithEmail('test@example.com', 'password123');

      expect(createUserWithEmailAndPassword).toHaveBeenCalled();
      expect(sendEmailVerification).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('signInWithEmail', () => {
    it('should sign in with email and password', async () => {
      const mockUser = { uid: '123', email: 'test@example.com' };
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({ user: mockUser } as any);

      const result = await service.signInWithEmail('test@example.com', 'password123');

      expect(signInWithEmailAndPassword).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe('signInWithGoogle', () => {
    it('should sign in with Google popup', async () => {
      const mockUser = { uid: '456', email: 'google@example.com' };
      vi.mocked(signInWithPopup).mockResolvedValue({ user: mockUser } as any);

      const result = await service.signInWithGoogle();

      expect(signInWithPopup).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe('sendPasswordReset', () => {
    it('should send password reset email', async () => {
      vi.mocked(sendPasswordResetEmail).mockResolvedValue(undefined);

      await service.sendPasswordReset('test@example.com');

      expect(sendPasswordResetEmail).toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    it('should sign out user', async () => {
      vi.mocked(firebaseSignOut).mockResolvedValue(undefined);

      await service.signOut();

      expect(firebaseSignOut).toHaveBeenCalled();
    });
  });

  describe('isFirstSignIn', () => {
    it('should return false if no user is signed in', async () => {
      const result = await service.isFirstSignIn();
      expect(result).toBeFalsy();
    });
  });

  describe('getErrorMessage', () => {
    it('should return generic message for undefined code', () => {
      const result = service.getErrorMessage(undefined);
      expect(result).toBe('An error occurred. Please try again');
    });

    it('should return specific message for auth/user-not-found', () => {
      const result = service.getErrorMessage('auth/user-not-found');
      expect(result).toBe('No account found with this email');
    });

    it('should return specific message for auth/wrong-password', () => {
      const result = service.getErrorMessage('auth/wrong-password');
      expect(result).toBe('Incorrect password');
    });

    it('should return specific message for auth/popup-blocked-by-user', () => {
      const result = service.getErrorMessage('auth/popup-blocked-by-user');
      expect(result).toBe('Popup was blocked by your browser. Please allow popups and try again');
    });

    it('should return generic message for unknown error code', () => {
      const result = service.getErrorMessage('auth/unknown-error');
      expect(result).toBe('An error occurred. Please try again');
    });
  });
});
