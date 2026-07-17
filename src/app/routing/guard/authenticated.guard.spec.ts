import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
}));

describe('isAuthenticatedGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export a guard function', async () => {
    const mod = await import('./authenticated.guard');
    expect(typeof mod.isAuthenticatedGuard).toBe('function');
    expect(typeof mod.isNotAuthenticatedGuard).toBe('function');
  });
});

describe('isNotAuthenticatedGuard', () => {
  it('should export a guard function', async () => {
    const mod = await import('./authenticated.guard');
    expect(typeof mod.isNotAuthenticatedGuard).toBe('function');
  });
});
