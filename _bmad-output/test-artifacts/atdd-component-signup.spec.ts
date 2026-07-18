import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SignupPageComponent } from './signup-page.component';
import { AuthService } from '../../services/auth.service';

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    onAuthStateChanged: vi.fn((cb) => {
      cb(null);
      return vi.fn();
    }),
  })),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendEmailVerification: vi.fn(),
  signOut: vi.fn(),
}));

describe('SignupPageComponent', () => {
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = {
      signUpWithEmail: vi.fn().mockResolvedValue({ uid: '123' }),
      signInWithGoogle: vi.fn().mockResolvedValue({ uid: '123' }),
    };

    await TestBed.configureTestingModule({
      imports: [SignupPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();
  });

  it.skip('should export the component class', () => {
    expect(typeof SignupPageComponent).toBe('function');
  });

  it.skip('should have signUpWithEmail method', () => {
    const fixture = TestBed.createComponent(SignupPageComponent);
    const component = fixture.componentInstance;
    expect(typeof component.signUpWithEmail).toBe('function');
  });

  it.skip('should have signUpWithGoogle method', () => {
    const fixture = TestBed.createComponent(SignupPageComponent);
    const component = fixture.componentInstance;
    expect(typeof component.signUpWithGoogle).toBe('function');
  });

  it.skip('should initialize with empty form fields', () => {
    const fixture = TestBed.createComponent(SignupPageComponent);
    const component = fixture.componentInstance;
    expect(component.email()).toBe('');
    expect(component.password()).toBe('');
    expect(component.confirmPassword()).toBe('');
  });

  it.skip('should initialize with no error', () => {
    const fixture = TestBed.createComponent(SignupPageComponent);
    const component = fixture.componentInstance;
    expect(component.error()).toBeNull();
  });

  it.skip('should initialize with loading false', () => {
    const fixture = TestBed.createComponent(SignupPageComponent);
    const component = fixture.componentInstance;
    expect(component.loading()).toBeFalsy();
  });
});
