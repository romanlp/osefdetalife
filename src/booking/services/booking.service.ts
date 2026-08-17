import { Service } from '@angular/core';
import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseDb } from '../../shared/firebase-config';
import type { Restaurant } from '../../shared/types/restaurant';

@Service()
export class BookingService {
  private db = getFirebaseDb();

  async getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
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
}
