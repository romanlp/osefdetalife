export interface Booking {
  id: string;
  restaurantId: string;
  date: string;
  time: string;
  duration: number;
  partySize: number;
  name: string;
  email: string;
  customFieldValue?: string;
  status: 'confirmed' | 'cancelled';
  createdAt: Date;
}

/**
 * AD-14 public projection stored at `restaurants/{restaurantId}/bookings-public/{id}` —
 * availability-only fields, no diner PII. Deliberately excludes `duration`; occupancy assumes the
 * documented default below until configurability arrives.
 */
export interface PublicBookingProjection {
  restaurantId: string;
  /** YYYY-MM-DD in the restaurant's timezone. */
  date: string;
  /** "HH:mm" 24-hour slot start. */
  time: string;
  partySize: number;
  status: 'confirmed' | 'cancelled';
}

/** Fixed dining window (minutes) a booking occupies its table. */
export const BOOKING_DURATION_MINUTES = 120;
