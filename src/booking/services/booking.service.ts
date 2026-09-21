import { Service } from '@angular/core';
import { collection, doc, getDoc, getDocs, query, where, serverTimestamp, writeBatch } from 'firebase/firestore';
import { getFirebaseDb } from '../../shared/firebase-config';
import { BOOKING_DURATION_MINUTES } from '../../shared/types/booking';
import type { PublicBookingProjection } from '../../shared/types/booking';
import type { Restaurant } from '../../shared/types/restaurant';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 128;

export interface CreateBookingInput {
  restaurantId: string;
  date: string;
  time: string;
  partySize: number;
  name: string;
  email: string;
  customFieldValue?: string;
}

@Service()
export class BookingService {
  private db = getFirebaseDb();

  async getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
    if (!slug || slug.length > MAX_SLUG_LENGTH || !SLUG_PATTERN.test(slug)) {
      return null;
    }

    const slugRef = doc(this.db, 'slugs', slug);
    const slugDoc = await getDoc(slugRef);

    if (!slugDoc.exists()) return null;

    const restaurantId = slugDoc.data()['restaurantId'] as string | undefined;
    if (!restaurantId) return null;

    const restaurantRef = doc(this.db, 'restaurants', restaurantId);
    const restaurantDoc = await getDoc(restaurantRef);

    if (!restaurantDoc.exists()) return null;

    return { id: restaurantDoc.id, ...restaurantDoc.data() } as Restaurant;
  }

  /**
   * Confirmed non-PII projections for one restaurant+day, read from the
   * `restaurants/{restaurantId}/bookings-public` public projection subcollection.
   * Equality-only clauses (date, status) below the restaurant — no composite index.
   */
  async getPublicBookings(
    restaurantId: string,
    dateIso: string,
  ): Promise<PublicBookingProjection[]> {
    const projectionsRef = collection(this.db, 'restaurants', restaurantId, 'bookings-public');
    const q = query(
      projectionsRef,
      where('date', '==', dateIso),
      where('status', '==', 'confirmed'),
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((projectionDoc) => projectionDoc.data() as PublicBookingProjection);
  }

  /**
   * Writes a confirmed booking and its non-PII public projection in one batch
   * under the same document ID. The booking carries diner PII; the projection
   * only carries availability fields. Callers trim inputs — this method writes
   * them verbatim.
   */
  async createBooking(input: CreateBookingInput): Promise<string> {
    const batch = writeBatch(this.db);
    const bookingRef = doc(collection(this.db, 'restaurants', input.restaurantId, 'bookings'));

    const bookingData: Record<string, unknown> = {
      restaurantId: input.restaurantId,
      date: input.date,
      time: input.time,
      partySize: input.partySize,
      name: input.name,
      email: input.email,
      status: 'confirmed',
      duration: BOOKING_DURATION_MINUTES,
      createdAt: serverTimestamp(),
    };
    if (input.customFieldValue !== undefined) {
      bookingData['customFieldValue'] = input.customFieldValue;
    }

    const projectionData: PublicBookingProjection = {
      restaurantId: input.restaurantId,
      date: input.date,
      time: input.time,
      partySize: input.partySize,
      status: 'confirmed',
    };

    const projectionRef = doc(this.db, 'restaurants', input.restaurantId, 'bookings-public', bookingRef.id);
    batch.set(bookingRef, bookingData);
    batch.set(projectionRef, projectionData);
    await batch.commit();
    return bookingRef.id;
  }
}
