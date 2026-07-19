import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { isOnboardedGuard, isNotOnboardedGuard } from './onboarding.guard';

const mockAuth = { currentUser: { uid: 'user-123' } as { uid: string } | null };

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => [{}]),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => mockAuth),
}));

const mockGetDocs = vi.fn();

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
}));

describe('onboarding guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.currentUser = { uid: 'user-123' };
  });

  describe('isOnboardedGuard', () => {
    it('should allow access when user has a completed restaurant', async () => {
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [{ data: () => ({ onboardingCompleted: true }) }],
      });

      const result = await runGuard(isOnboardedGuard);
      expect(result).toBe(true);
    });

    it('should redirect to /onboarding when user has no restaurant', async () => {
      mockGetDocs.mockResolvedValue({ empty: true, docs: [] });

      const result = await runGuard(isOnboardedGuard);
      expect(result.toString()).toBe('/onboarding');
    });

    it('should redirect to /onboarding when restaurant exists but onboarding not completed', async () => {
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [{ data: () => ({ onboardingCompleted: false }) }],
      });

      const result = await runGuard(isOnboardedGuard);
      expect(result.toString()).toBe('/onboarding');
    });

    it('should redirect to /login when user is not authenticated', async () => {
      mockAuth.currentUser = null;

      const result = await runGuard(isOnboardedGuard);
      expect(result.toString()).toBe('/login');
    });

    it('should redirect to /onboarding on Firestore error', async () => {
      mockGetDocs.mockRejectedValue(new Error('Firestore error'));

      const result = await runGuard(isOnboardedGuard);
      expect(result.toString()).toBe('/onboarding');
    });
  });

  describe('isNotOnboardedGuard', () => {
    it('should allow access when user has no restaurant', async () => {
      mockGetDocs.mockResolvedValue({ empty: true, docs: [] });

      const result = await runGuard(isNotOnboardedGuard);
      expect(result).toBe(true);
    });

    it('should allow access when restaurant exists but onboarding not completed', async () => {
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [{ data: () => ({ onboardingCompleted: false }) }],
      });

      const result = await runGuard(isNotOnboardedGuard);
      expect(result).toBe(true);
    });

    it('should redirect to /dashboard when onboarding is completed', async () => {
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [{ data: () => ({ onboardingCompleted: true }) }],
      });

      const result = await runGuard(isNotOnboardedGuard);
      expect(result.toString()).toBe('/dashboard');
    });

    it('should redirect to /login when user is not authenticated', async () => {
      mockAuth.currentUser = null;

      const result = await runGuard(isNotOnboardedGuard);
      expect(result.toString()).toBe('/login');
    });

    it('should fail open on Firestore error', async () => {
      mockGetDocs.mockRejectedValue(new Error('Firestore error'));

      const result = await runGuard(isNotOnboardedGuard);
      expect(result).toBe(true);
    });
  });
});

async function runGuard(guard: typeof isOnboardedGuard) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideRouter([
      { path: 'onboarding', component: {} as never },
      { path: 'dashboard', component: {} as never },
      { path: 'login', component: {} as never },
    ])],
  });

  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;
  return TestBed.runInInjectionContext(async () => guard(route, state));
}
