import {
  runTransaction,
  doc,
  getDoc,
  setDoc,
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

  const slugDoc = await getDoc(slugRef);
  if (slugDoc.exists()) {
    throw new Error(`Slug "${slug}" is already taken`);
  }

  await runTransaction(db, async (transaction) => {
    transaction.set(restaurantRef, {
      ...data,
      slug,
      createdAt: serverTimestamp(),
    });
    transaction.set(slugRef, { restaurantId });
  });
}
