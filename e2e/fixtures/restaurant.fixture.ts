import { test as base } from '@playwright/test';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { getAuthInstance } from '../utils/firebase';
import { createUserWithEmailAndPassword, deleteUser, signOut } from 'firebase/auth';
import { createRestaurantData, createTableGroupData, createUserData } from './factories';
import type { Restaurant, TableGroup } from './types';
import type { FirebaseFixtures } from './firebase.fixture';

export interface RestaurantFixtures {
  restaurant: Restaurant;
  tableGroups: TableGroup[];
  restaurantPage: RestaurantPage;
}

class RestaurantPage {
  constructor(
    public page: import('@playwright/test').Page,
    private slug: string
  ) {}

  async goto() {
    await this.page.goto(`/book/${this.slug}`);
  }

  get name() {
    return this.page.locator('[data-testid="restaurant-name"]');
  }

  get address() {
    return this.page.locator('[data-testid="restaurant-address"]');
  }

  get bookButton() {
    return this.page.locator('[data-testid="book-button"]');
  }
}

export const test = base.extend<RestaurantFixtures & FirebaseFixtures>({
  restaurant: async ({ db }, use) => {
    const auth = getAuthInstance();
    const owner = createUserData();
    await createUserWithEmailAndPassword(auth, owner.email, owner.password);

    // Embedded table groups (cap-2 ×2 / cap-4 ×3 / cap-6 ×1) are the public
    // availability source of truth — seeded on the restaurant doc itself.
    const tableGroups = [
      { capacity: 2, count: 2 },
      { capacity: 4, count: 3 },
      { capacity: 6, count: 1 },
    ];
    const restaurantData = createRestaurantData({
      ownerId: auth.currentUser!.uid,
      tableGroups,
    });
    const restaurantRef = doc(collection(db, 'restaurants'), restaurantData.id);
    const slugRef = doc(collection(db, 'slugs'), restaurantData.slug);
    await setDoc(restaurantRef, restaurantData);
    await setDoc(slugRef, { restaurantId: restaurantData.id });
    
    await use(restaurantData);
    
    try {
      await deleteDoc(slugRef);
    } finally {
      try {
        await deleteDoc(restaurantRef);
      } finally {
        try {
          await deleteUser(auth.currentUser!);
        } finally {
          await signOut(auth);
        }
      }
    }
  },

  tableGroups: async ({ db, restaurant }, use) => {
    const tableGroups = [
      createTableGroupData(restaurant.id, { capacity: 2, count: 2 }),
      createTableGroupData(restaurant.id, { capacity: 4, count: 3 }),
      createTableGroupData(restaurant.id, { capacity: 6, count: 1 }),
    ];
    
    for (const tableGroup of tableGroups) {
      const tableGroupRef = doc(collection(db, 'restaurants', restaurant.id, 'tables'), tableGroup.id);
      await setDoc(tableGroupRef, tableGroup);
    }
    
    await use(tableGroups);
    
    for (const tableGroup of tableGroups) {
      const tableGroupRef = doc(collection(db, 'restaurants', restaurant.id, 'tables'), tableGroup.id);
      await deleteDoc(tableGroupRef);
    }
  },

  restaurantPage: async ({ page, restaurant }, use) => {
    const restaurantPage = new RestaurantPage(page, restaurant.slug);
    await use(restaurantPage);
  },
});

export { expect } from '@playwright/test';
