import { describe, it, expect } from 'vitest';
import type { OpeningHours, TableGroup } from './restaurant';

describe('OpeningHours', () => {
  it('should accept ISO day keys 1-7', () => {
    const hours: OpeningHours = {
      1: { open: '09:00', close: '17:00' },
      2: { open: '09:00', close: '17:00' },
      3: { open: '09:00', close: '17:00' },
      4: { open: '09:00', close: '17:00' },
      5: { open: '09:00', close: '17:00' },
      6: { open: '10:00', close: '14:00' },
      7: { open: '00:00', close: '00:00' },
    };
    expect(hours[1]).toEqual({ open: '09:00', close: '17:00' });
    expect(hours[7]).toEqual({ open: '00:00', close: '00:00' });
  });

  it('should accept partial hours (not all days required)', () => {
    const hours: OpeningHours = {
      1: { open: '09:00', close: '17:00' },
      5: { open: '10:00', close: '16:00' },
    };
    expect(hours[1]).toBeDefined();
    expect(hours[5]).toBeDefined();
  });
});

describe('TableGroup', () => {
  it('should have capacity as number', () => {
    const group: TableGroup = { capacity: 4, count: 2 };
    expect(typeof group.capacity).toBe('number');
  });

  it('should have count as number', () => {
    const group: TableGroup = { capacity: 4, count: 2 };
    expect(typeof group.count).toBe('number');
  });
});
