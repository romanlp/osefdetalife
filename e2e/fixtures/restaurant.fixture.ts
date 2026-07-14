import { test as base } from '@playwright/test';
import { Firestore, collection, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '../utils/firebase';
import { createRestaurantData, createTableGroupData } from './factories';
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
    await this.page.goto(`/widget/${this.slug}`);
  }

  get name() {
    return this.page.locator('[data-testid="restaurant-name"]');
  }

  get bookButton() {
    return this.page.locator('[data-testid="book-button"]');
  }
}

export const test = base.extend<RestaurantFixtures & FirebaseFixtures>({
  restaurant: async ({ db, cleanupFirestore }, use) => {
    const restaurantData = createRestaurantData();
    const restaurantRef = doc(collection(db, 'restaurants'), restaurantData.id);
    await setDoc(restaurantRef, restaurantData);
    
    await use(restaurantData);
    
    await deleteDoc(restaurantRef);
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
