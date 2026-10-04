import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ name: 'mock-app' })),
  getApps: vi.fn(() => []),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({ type: 'firestore' })),
  connectFirestoreEmulator: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ type: 'auth' })),
  connectAuthEmulator: vi.fn(),
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

  describe('isLoopbackHostname', () => {
    it.each(['localhost', 'LOCALHOST', '127.0.0.1', '::1', '[::1]'])(
      'treats %s as loopback',
      async (hostname) => {
        const mod = await import('./firebase-config');
        expect(mod.isLoopbackHostname(hostname)).toBe(true);
      },
    );

    it.each(['192.168.1.5', 'example.com', 'localhost.evil.com', '10.0.0.1', ''])(
      'treats %s as non-loopback',
      async (hostname) => {
        const mod = await import('./firebase-config');
        expect(mod.isLoopbackHostname(hostname)).toBe(false);
      },
    );
  });

  describe('connectToEmulators', () => {
    const setHostname = (hostname: string) => {
      Object.defineProperty(window, 'location', {
        value: { hostname },
        writable: true,
        configurable: true,
      });
    };

    afterEach(() => {
      vi.resetModules();
    });

    it('connects to the emulators on a 127.0.0.1 origin', async () => {
      setHostname('127.0.0.1');
      const { connectFirestoreEmulator } = await import('firebase/firestore');
      const { connectAuthEmulator } = await import('firebase/auth');
      const mod = await import('./firebase-config');

      mod.connectToEmulators();

      expect(connectFirestoreEmulator).toHaveBeenCalledWith(
        expect.anything(),
        'localhost',
        8081,
      );
      expect(connectAuthEmulator).toHaveBeenCalledWith(
        expect.anything(),
        'http://localhost:9099',
      );
    });

    it('does not connect and reports loudly on a non-loopback origin', async () => {
      setHostname('192.168.1.5');
      const { connectFirestoreEmulator } = await import('firebase/firestore');
      const { connectAuthEmulator } = await import('firebase/auth');
      const mod = await import('./firebase-config');
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      mod.connectToEmulators();

      expect(connectFirestoreEmulator).not.toHaveBeenCalled();
      expect(connectAuthEmulator).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('192.168.1.5'),
      );

      errorSpy.mockRestore();
    });
  });
});
