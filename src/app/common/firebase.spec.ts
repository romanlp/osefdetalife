import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ name: 'mock-app' })),
  getApps: vi.fn(() => []),
  registerVersion: vi.fn(),
}));

vi.mock('firebase/app-check', () => ({
  initializeAppCheck: vi.fn(),
  ReCaptchaV3Provider: vi.fn(),
}));

vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(),
}));

vi.mock('firebase/performance', () => ({
  getPerformance: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({ type: 'firestore' })),
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({ type: 'storage' })),
}));

describe('common/firebase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export injection tokens', async () => {
    const mod = await import('./firebase');
    expect(mod.PROVIDED_FIREBASE_APP).toBeDefined();
    expect(mod.APP_CHECK).toBeDefined();
    expect(mod.ANALYTICS).toBeDefined();
    expect(mod.PERFORMANCE).toBeDefined();
    expect(mod.FIRESTORE).toBeDefined();
    expect(mod.STORAGE).toBeDefined();
  });

  it('should export provider functions', async () => {
    const mod = await import('./firebase');
    expect(typeof mod.provideFirebaseApp).toBe('function');
    expect(typeof mod.provideAppCheck).toBe('function');
    expect(typeof mod.provideAnalytics).toBe('function');
    expect(typeof mod.providePerformance).toBe('function');
    expect(typeof mod.provideFirestore).toBe('function');
    expect(typeof mod.provideStorage).toBe('function');
  });

  it('should export Firebase service class', async () => {
    const mod = await import('./firebase');
    expect(typeof mod.Firebase).toBe('function');
  });
});
