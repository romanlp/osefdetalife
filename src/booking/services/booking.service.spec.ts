import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BookingService } from './booking.service';

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn((_db: unknown, ...segments: string[]) => ({
    _path: segments.join('/'),
    id: segments[segments.length - 1],
  })),
  getDoc: vi.fn(),
}));

describe('BookingService', () => {
  let service: BookingService;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookingService);
  });

  describe('getRestaurantBySlug', () => {
    it('HAPPY_PATH: should resolve a restaurant from a slug via slugs -> restaurants', async () => {
      const { getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc)
        .mockResolvedValueOnce({
          exists: () => true,
          id: 'the-blue-bistro',
          data: () => ({ restaurantId: 'rest-123' }),
        } as never)
        .mockResolvedValueOnce({
          exists: () => true,
          id: 'rest-123',
          data: () => ({
            name: 'The Blue Bistro',
            slug: 'the-blue-bistro',
            ownerId: 'user-1',
            whiteLabel: { primaryColor: '#C0392B', secondaryColor: '#27AE60' },
          }),
        } as never);

      const result = await service.getRestaurantBySlug('the-blue-bistro');

      expect(getDoc).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        id: 'rest-123',
        name: 'The Blue Bistro',
        slug: 'the-blue-bistro',
        ownerId: 'user-1',
        whiteLabel: { primaryColor: '#C0392B', secondaryColor: '#27AE60' },
      });
    });

    it('INVALID_SLUG: should return null when the slug doc does not exist', async () => {
      const { getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
        id: 'nope',
        data: () => ({}),
      } as never);

      const result = await service.getRestaurantBySlug('nope');

      expect(result).toBeNull();
      expect(getDoc).toHaveBeenCalledTimes(1);
    });

    it('SLUG_MALFORMED: should return null (not throw) when the slug doc has no restaurantId', async () => {
      const { getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'orphan',
        data: () => ({}),
      } as never);

      const result = await service.getRestaurantBySlug('orphan');

      expect(result).toBeNull();
      expect(getDoc).toHaveBeenCalledTimes(1);
    });

    it('SLUG_MALFORMED: should return null (not throw) when restaurantId is empty', async () => {
      const { getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'orphan',
        data: () => ({ restaurantId: '' }),
      } as never);

      const result = await service.getRestaurantBySlug('orphan');

      expect(result).toBeNull();
      expect(getDoc).toHaveBeenCalledTimes(1);
    });

    it('SLUG_VALIDATION: should return null without Firestore call for path-traversal slug', async () => {
      const { getDoc } = await import('firebase/firestore');

      const result = await service.getRestaurantBySlug('../etc/passwd');

      expect(result).toBeNull();
      expect(getDoc).not.toHaveBeenCalled();
    });

    it('SLUG_VALIDATION: should return null without Firestore call for oversized slug', async () => {
      const { getDoc } = await import('firebase/firestore');
      const longSlug = 'a'.repeat(200);

      const result = await service.getRestaurantBySlug(longSlug);

      expect(result).toBeNull();
      expect(getDoc).not.toHaveBeenCalled();
    });

    it('SLUG_VALIDATION: should return null without Firestore call for slug with uppercase', async () => {
      const { getDoc } = await import('firebase/firestore');

      const result = await service.getRestaurantBySlug('The-Blue-Bistro');

      expect(result).toBeNull();
      expect(getDoc).not.toHaveBeenCalled();
    });

    it('SLUG_VALIDATION: should return null without Firestore call for slug with special characters', async () => {
      const { getDoc } = await import('firebase/firestore');

      const result = await service.getRestaurantBySlug('slug#fragment');

      expect(result).toBeNull();
      expect(getDoc).not.toHaveBeenCalled();
    });

    it('SLUG_VALIDATION: should return null without Firestore call for empty slug', async () => {
      const { getDoc } = await import('firebase/firestore');

      const result = await service.getRestaurantBySlug('');

      expect(result).toBeNull();
      expect(getDoc).not.toHaveBeenCalled();
    });

    it('RESTAURANT_MISSING: should return null when the restaurant doc does not exist', async () => {
      const { getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc)
        .mockResolvedValueOnce({
          exists: () => true,
          id: 'the-blue-bistro',
          data: () => ({ restaurantId: 'missing-123' }),
        } as never)
        .mockResolvedValueOnce({
          exists: () => false,
          id: 'missing-123',
          data: () => ({}),
        } as never);

      const result = await service.getRestaurantBySlug('the-blue-bistro');

      expect(result).toBeNull();
      expect(getDoc).toHaveBeenCalledTimes(2);
    });

    it('FIREBASE_ERROR: should propagate getDoc rejection to the caller', async () => {
      const { getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockRejectedValueOnce(new Error('permission-denied'));

      await expect(service.getRestaurantBySlug('the-blue-bistro')).rejects.toThrow(
        'permission-denied',
      );
    });
  });
});
