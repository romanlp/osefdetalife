import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ name: 'mock-app' })),
  getApps: vi.fn(() => []),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({ type: 'firestore' })),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ type: 'auth' })),
}));

describe('shared/firebase-config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export getFirebaseApp function', async () => {
    const mod = await import('./firebase-config');
    expect(typeof mod.getFirebaseApp).toBe('function');
  });

  it('should export getFirebaseDb function', async () => {
    const mod = await import('./firebase-config');
    expect(typeof mod.getFirebaseDb).toBe('function');
  });

  it('should export getFirebaseAuth function', async () => {
    const mod = await import('./firebase-config');
    expect(typeof mod.getFirebaseAuth).toBe('function');
  });

  it('should export connectToEmulators function', async () => {
    const mod = await import('./firebase-config');
    expect(typeof mod.connectToEmulators).toBe('function');
  });
});
