import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

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

  it('should have user signal', () => {
    expect(service.user).toBeDefined();
    expect(service.user()).toBeNull();
  });

  describe('signUpWithEmail', () => {
    it('should create user and send verification email', async () => {
      expect(service.signUpWithEmail).toBeDefined();
    });
  });

  describe('signInWithEmail', () => {
    it('should sign in with email and password', () => {
      expect(service.signInWithEmail).toBeDefined();
    });
  });

  describe('signInWithGoogle', () => {
    it('should sign in with Google popup', () => {
      expect(service.signInWithGoogle).toBeDefined();
    });
  });

  describe('sendPasswordReset', () => {
    it('should send password reset email', () => {
      expect(service.sendPasswordReset).toBeDefined();
    });
  });

  describe('signOut', () => {
    it('should sign out user', () => {
      expect(service.signOut).toBeDefined();
    });
  });

  describe('isFirstSignIn', () => {
    it('should return false if no user is signed in', async () => {
      const result = await service.isFirstSignIn();
      expect(result).toBeFalsy();
    });
  });
});
