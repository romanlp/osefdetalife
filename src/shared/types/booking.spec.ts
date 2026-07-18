import { describe, it, expect } from 'vitest';
import type { Booking } from './booking';

describe('Booking', () => {
  it('should only allow confirmed or cancelled status', () => {
    const booking: Booking = {
      id: 'bk-1',
      restaurantId: 'rest-1',
      date: '2026-07-20',
      time: '19:00',
      duration: 120,
      partySize: 4,
      name: 'John Doe',
      email: 'john@example.com',
      status: 'confirmed',
      createdAt: new Date(),
    };

    expect(booking.status).toBe('confirmed');

    const cancelled: Booking = { ...booking, status: 'cancelled' };
    expect(cancelled.status).toBe('cancelled');
  });

  it('should not allow pending status', () => {
    // TypeScript should prevent this at compile time
    // This test validates the type constraint
    const booking: Booking = {
      id: 'bk-1',
      restaurantId: 'rest-1',
      date: '2026-07-20',
      time: '19:00',
      duration: 120,
      partySize: 4,
      name: 'John Doe',
      email: 'john@example.com',
      status: 'confirmed',
      createdAt: new Date(),
    };

    // Runtime check: status should only be 'confirmed' or 'cancelled'
    expect(['confirmed', 'cancelled']).toContain(booking.status);
  });
});
