import {
  runTransaction,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase-config';
import type { Restaurant } from './types/restaurant';

export async function createRestaurantWithSlug(
  restaurantId: string,
  slug: string,
  data: Omit<Restaurant, 'id' | 'createdAt'>
): Promise<void> {
  const db = getFirebaseDb();
  const slugRef = doc(db, 'slugs', slug);
  const restaurantRef = doc(db, 'restaurants', restaurantId);

  await runTransaction(db, async (transaction) => {
    const slugDoc = await transaction.get(slugRef);
    if (slugDoc.exists()) {
      throw new Error(`Slug "${slug}" is already taken`);
    }

    transaction.set(restaurantRef, {
      ...data,
      slug,
      createdAt: serverTimestamp(),
    });
    transaction.set(slugRef, { restaurantId });
  });
}
