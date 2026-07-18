import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoginPageComponent } from './login-page.component';
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

describe('LoginPageComponent', () => {
  let mockAuthService: {
    signInWithEmail: ReturnType<typeof vi.fn>;
    signInWithGoogle: ReturnType<typeof vi.fn>;
    isFirstSignIn: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockAuthService = {
      signInWithEmail: vi.fn().mockResolvedValue({ uid: '123' }),
      signInWithGoogle: vi.fn().mockResolvedValue({ uid: '123' }),
      isFirstSignIn: vi.fn().mockResolvedValue(false),
    };

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();
  });

  it('should export the component class', () => {
    expect(typeof LoginPageComponent).toBe('function');
  });

  it('should have loginWithEmail method', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    const component = fixture.componentInstance;
    expect(typeof component.loginWithEmail).toBe('function');
  });

  it('should have loginWithGoogle method', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    const component = fixture.componentInstance;
    expect(typeof component.loginWithGoogle).toBe('function');
  });

  it('should initialize with empty email and password', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    const component = fixture.componentInstance;
    expect(component.email()).toBe('');
    expect(component.password()).toBe('');
  });

  it('should initialize with no error', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    const component = fixture.componentInstance;
    expect(component.error()).toBeNull();
  });

  it('should initialize with loading false', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    const component = fixture.componentInstance;
    expect(component.loading()).toBeFalsy();
  });
});
