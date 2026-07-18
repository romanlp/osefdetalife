import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { OnboardingService } from './onboarding.service';

const mockAuth = { currentUser: { uid: 'user-123' } as { uid: string } | null };

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => mockAuth),
}));

const mockBatch = {
  set: vi.fn(),
  commit: vi.fn(() => Promise.resolve()),
};

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn((_db: unknown, ...segments: string[]) => ({
    _path: segments.join('/'),
  })),
  collection: vi.fn((_db: unknown, _name: string) => ({
    _collection: _name,
  })),
  setDoc: vi.fn(() => Promise.resolve()),
  getDoc: vi.fn(() =>
    Promise.resolve({ exists: () => false, id: 'test', data: () => ({}) }),
  ),
  updateDoc: vi.fn(() => Promise.resolve()),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
  writeBatch: vi.fn(() => mockBatch),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
}));

describe('OnboardingService', () => {
  let service: OnboardingService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.currentUser = { uid: 'user-123' };
    TestBed.configureTestingModule({});
    service = TestBed.inject(OnboardingService);
  });

  describe('generateSlug', () => {
    it('should convert name to lowercase slug', () => {
      expect(service.generateSlug('The Blue Bistro')).toBe('the-blue-bistro');
    });

    it('should remove special characters', () => {
      expect(service.generateSlug("Joe's Café & Bar")).toBe('joes-caf-bar');
    });

    it('should handle multiple spaces', () => {
      expect(service.generateSlug('The   Blue   Bistro')).toBe('the-blue-bistro');
    });

    it('should trim leading/trailing hyphens', () => {
      expect(service.generateSlug('  The Blue Bistro  ')).toBe('the-blue-bistro');
    });
  });

  describe('checkSlugAvailability', () => {
    it('should return true when slug does not exist', async () => {
      const { getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
        id: 'test-slug',
        data: () => ({}),
      } as never);

      const result = await service.checkSlugAvailability('test-slug');
      expect(result).toBe(true);
    });

    it('should return false when slug already exists', async () => {
      const { getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'test-slug',
        data: () => ({ restaurantId: 'existing-123' }),
      } as never);

      const result = await service.checkSlugAvailability('test-slug');
      expect(result).toBe(false);
    });
  });

  describe('createRestaurant', () => {
    it('should create restaurant and slug documents atomically', async () => {
      const { doc } = await import('firebase/firestore');
      let callCount = 0;
      vi.mocked(doc).mockImplementation((_db: unknown, ...segments: string[]) => {
        callCount++;
        return { _path: segments.join('/'), id: callCount === 1 ? 'new-restaurant-id' : undefined } as never;
      });

      const result = await service.createRestaurant('Blue Bistro', 'blue-bistro', '123 Main St');

      expect(mockBatch.set).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);
      expect(result).toBe('new-restaurant-id');
    });

    it('should throw if user not authenticated', async () => {
      mockAuth.currentUser = null;

      await expect(
        service.createRestaurant('Blue Bistro', 'blue-bistro'),
      ).rejects.toThrow('User not authenticated');
    });
  });

  describe('getRestaurant', () => {
    it('should return restaurant data when it exists', async () => {
      const { getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'rest-123',
        data: () => ({ name: 'Blue Bistro', slug: 'blue-bistro', ownerId: 'user-123' }),
      } as never);

      const result = await service.getRestaurant('rest-123');
      expect(result).toEqual({
        id: 'rest-123',
        name: 'Blue Bistro',
        slug: 'blue-bistro',
        ownerId: 'user-123',
      });
    });

    it('should return null when restaurant does not exist', async () => {
      const { getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
        id: 'nonexistent',
        data: () => ({}),
      } as never);

      const result = await service.getRestaurant('nonexistent');
      expect(result).toBeNull();
    });
  });
});
