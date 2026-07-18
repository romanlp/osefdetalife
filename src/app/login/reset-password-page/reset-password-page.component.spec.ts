import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ResetPasswordPageComponent } from './reset-password-page.component';
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

describe('ResetPasswordPageComponent', () => {
  let mockAuthService: {
    sendPasswordReset: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockAuthService = {
      sendPasswordReset: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [ResetPasswordPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();
  });

  it('should export the component class', () => {
    expect(typeof ResetPasswordPageComponent).toBe('function');
  });

  it('should have sendResetEmail method', () => {
    const fixture = TestBed.createComponent(ResetPasswordPageComponent);
    const component = fixture.componentInstance;
    expect(typeof component.sendResetEmail).toBe('function');
  });

  it('should initialize with empty email', () => {
    const fixture = TestBed.createComponent(ResetPasswordPageComponent);
    const component = fixture.componentInstance;
    expect(component.email()).toBe('');
  });

  it('should initialize with no error', () => {
    const fixture = TestBed.createComponent(ResetPasswordPageComponent);
    const component = fixture.componentInstance;
    expect(component.error()).toBeNull();
  });

  it('should initialize with loading false', () => {
    const fixture = TestBed.createComponent(ResetPasswordPageComponent);
    const component = fixture.componentInstance;
    expect(component.loading()).toBeFalsy();
  });

  it('should initialize with sent false', () => {
    const fixture = TestBed.createComponent(ResetPasswordPageComponent);
    const component = fixture.componentInstance;
    expect(component.sent()).toBeFalsy();
  });
});
