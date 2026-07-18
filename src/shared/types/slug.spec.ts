import { describe, it, expect } from 'vitest';
import type { SlugMapping } from './slug';

describe('SlugMapping', () => {
  it('should have slug as string', () => {
    const mapping: SlugMapping = { slug: 'test-slug', restaurantId: 'rest-123' };
    expect(typeof mapping.slug).toBe('string');
  });

  it('should have restaurantId as string', () => {
    const mapping: SlugMapping = { slug: 'test-slug', restaurantId: 'rest-123' };
    expect(typeof mapping.restaurantId).toBe('string');
  });

  it('should accept valid slug mapping', () => {
    const mapping: SlugMapping = { slug: 'the-blue-bistro', restaurantId: 'abc-123' };
    expect(mapping.slug).toBe('the-blue-bistro');
    expect(mapping.restaurantId).toBe('abc-123');
  });
});
