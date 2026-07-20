import { Injectable, signal } from '@angular/core';
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { getFirebaseDb, getFirebaseAuth } from '../../shared/firebase-config';
import type { Restaurant } from '../../shared/types/restaurant';

@Injectable({
  providedIn: 'root',
})
export class OnboardingService {
  private db = getFirebaseDb();
  private auth = getFirebaseAuth();
  private loading = signal(false);

  get isLoading() {
    return this.loading.asReadonly();
  }

  generateSlug(name: string): string {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return slug || 'restaurant';
  }

  async checkSlugAvailability(slug: string): Promise<boolean> {
    const slugRef = doc(this.db, 'slugs', slug);
    const slugDoc = await getDoc(slugRef);
    return !slugDoc.exists();
  }

  async createRestaurant(
    name: string,
    slug: string,
    address?: string,
  ): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    this.loading.set(true);

    try {
      const restaurantData: Omit<Restaurant, 'id'> = {
        name,
        slug,
        ownerId: user.uid,
        timezone: 'Europe/London',
        hours: {},
        tableGroups: [],
        whiteLabel: {
          primaryColor: '#000000',
          secondaryColor: '#FFFFFF',
        },
        onboardingCompleted: false,
        createdAt: new Date(),
      };

      if (address) {
        restaurantData.address = address;
      }

      const restaurantRef = doc(collection(this.db, 'restaurants'));

      const batch = writeBatch(this.db);
      batch.set(restaurantRef, {
        ...restaurantData,
        createdAt: serverTimestamp(),
      });

      const slugRef = doc(this.db, 'slugs', slug);
      batch.set(slugRef, {
        restaurantId: restaurantRef.id,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      });

      await batch.commit();

      return restaurantRef.id;
    } finally {
      this.loading.set(false);
    }
  }

  async updateRestaurant(
    restaurantId: string,
    data: Partial<Omit<Restaurant, 'id' | 'slug' | 'ownerId'>>,
  ): Promise<void> {
    const restaurantRef = doc(this.db, 'restaurants', restaurantId);
    await updateDoc(restaurantRef, data);
  }

  async getRestaurant(restaurantId: string): Promise<Restaurant | null> {
    const restaurantRef = doc(this.db, 'restaurants', restaurantId);
    const restaurantDoc = await getDoc(restaurantRef);

    if (!restaurantDoc.exists()) return null;

    return { id: restaurantDoc.id, ...restaurantDoc.data() } as Restaurant;
  }
}
