import { initializeApp, deleteApp } from 'firebase/app';
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  collection,
} from 'firebase/firestore';
import { afterAll, beforeAll, describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';

const PROJECT_ID = 'test-osefdetalife';
const HOST = 'localhost';
const PORT = 8080;

let adminApp: ReturnType<typeof initializeApp>;
let adminDb: ReturnType<typeof getFirestore>;

let unauthApp: ReturnType<typeof initializeApp>;
let unauthDb: ReturnType<typeof getFirestore>;

let user1App: ReturnType<typeof initializeApp>;
let user1Db: ReturnType<typeof getFirestore>;

let user2App: ReturnType<typeof initializeApp>;
let user2Db: ReturnType<typeof getFirestore>;

function createApp(name: string) {
  return initializeApp({ projectId: PROJECT_ID }, name);
}

beforeAll(async () => {
  adminApp = createApp('admin');
  adminDb = getFirestore(adminApp);
  connectFirestoreEmulator(adminDb, HOST, PORT, { mockUserToken: 'owner' });

  unauthApp = createApp('unauth');
  unauthDb = getFirestore(unauthApp);
  connectFirestoreEmulator(unauthDb, HOST, PORT);

  user1App = createApp('user1');
  user1Db = getFirestore(user1App);
  connectFirestoreEmulator(user1Db, HOST, PORT, { mockUserToken: { sub: 'user-1' } });

  user2App = createApp('user2');
  user2Db = getFirestore(user2App);
  connectFirestoreEmulator(user2Db, HOST, PORT, { mockUserToken: { sub: 'user-2' } });
});

afterAll(async () => {
  await deleteApp(adminApp);
  await deleteApp(unauthApp);
  await deleteApp(user1App);
  await deleteApp(user2App);
});

const VALID_RESTAURANT = {
  name: 'Test Restaurant',
  slug: 'test-restaurant',
  ownerId: 'user-1',
  timezone: 'Europe/London',
  hours: {},
  whiteLabel: { primaryColor: '#000', secondaryColor: '#fff' },
  createdAt: new Date(),
};

const VALID_BOOKING = {
  restaurantId: 'rest-1',
  date: '2026-07-20',
  time: '19:00',
  duration: 120,
  partySize: 4,
  name: 'John Doe',
  email: 'john@example.com',
  status: 'confirmed' as const,
};

async function seedAdminData(path: string, data: Record<string, unknown>) {
  await setDoc(doc(adminDb, path), data);
}

async function clearAll() {
  const collections = ['restaurants', 'slugs'];
  for (const col of collections) {
    const snap = await getDocs(collection(adminDb, col));
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
  }
}

describe('Firestore Security Rules', () => {
  beforeAll(async () => {
    await clearAll();
  });

  describe('Restaurants', () => {
    it('should allow unauthenticated read', async () => {
      await seedAdminData('restaurants/rest-1', VALID_RESTAURANT);
      await expect(getDoc(doc(unauthDb, 'restaurants/rest-1'))).resolves.toBeDefined();
    });

    it('should deny unauthenticated write', async () => {
      await expect(
        setDoc(doc(unauthDb, 'restaurants/rest-1'), {
          name: 'Hacked',
          slug: 'hacked',
          ownerId: 'nobody',
          timezone: 'UTC',
        })
      ).rejects.toThrow();
    });

    it('should allow authenticated owner create on own restaurant', async () => {
      await expect(
        setDoc(doc(user1Db, 'restaurants/rest-1'), VALID_RESTAURANT)
      ).resolves.toBeUndefined();
    });

    it('should deny write to other restaurant', async () => {
      await seedAdminData('restaurants/rest-2', {
        ...VALID_RESTAURANT,
        ownerId: 'user-1',
      });
      await expect(
        updateDoc(doc(user2Db, 'restaurants/rest-2'), { name: 'Hacked' })
      ).rejects.toThrow();
    });
  });

  describe('Slugs', () => {
    it('should allow public read', async () => {
      await seedAdminData('slugs/my-slug', { restaurantId: 'rest-1' });
      await expect(getDoc(doc(unauthDb, 'slugs/my-slug'))).resolves.toBeDefined();
    });

    it('should deny unauthenticated create', async () => {
      await expect(
        setDoc(doc(unauthDb, 'slugs/new-slug'), { restaurantId: 'rest-1' })
      ).rejects.toThrow();
    });

    it('should allow authenticated create', async () => {
      await expect(
        setDoc(doc(user1Db, 'slugs/new-user-slug'), { restaurantId: 'rest-1' })
      ).resolves.toBeUndefined();
    });

    it('should deny update and delete', async () => {
      await seedAdminData('slugs/immutable-slug', { restaurantId: 'rest-1' });
      await expect(
        updateDoc(doc(user1Db, 'slugs/immutable-slug'), { restaurantId: 'rest-2' })
      ).rejects.toThrow();
      await expect(
        deleteDoc(doc(user1Db, 'slugs/immutable-slug'))
      ).rejects.toThrow();
    });
  });

  describe('Tables subcollection', () => {
    it('should allow public read', async () => {
      await seedAdminData('restaurants/rest-1', VALID_RESTAURANT);
      await seedAdminData('restaurants/rest-1/tables/table-1', {
        capacity: 4,
        count: 2,
      });
      await expect(
        getDoc(doc(unauthDb, 'restaurants/rest-1/tables/table-1'))
      ).resolves.toBeDefined();
    });

    it('should allow owner write with valid data', async () => {
      await expect(
        setDoc(doc(user1Db, 'restaurants/rest-1/tables/table-2'), {
          capacity: 6,
          count: 1,
        })
      ).resolves.toBeUndefined();
    });

    it('should deny write with invalid capacity', async () => {
      await expect(
        setDoc(doc(user1Db, 'restaurants/rest-1/tables/table-bad'), {
          capacity: -1,
          count: 2,
        })
      ).rejects.toThrow();
    });
  });

  describe('Bookings subcollection', () => {
    it('should allow unauthenticated create with valid data', async () => {
      await expect(
        setDoc(doc(unauthDb, 'restaurants/rest-1/bookings/bk-1'), VALID_BOOKING)
      ).resolves.toBeUndefined();
    });

    it('should deny create with missing required fields', async () => {
      await expect(
        setDoc(doc(unauthDb, 'restaurants/rest-1/bookings/bk-2'), {
          restaurantId: 'rest-1',
          date: '2026-07-20',
        })
      ).rejects.toThrow();
    });

    it('should deny create with invalid status', async () => {
      await expect(
        setDoc(doc(unauthDb, 'restaurants/rest-1/bookings/bk-3'), {
          ...VALID_BOOKING,
          status: 'pending',
        })
      ).rejects.toThrow();
    });

    it('should allow owner read', async () => {
      await expect(
        getDoc(doc(user1Db, 'restaurants/rest-1/bookings/bk-1'))
      ).resolves.toBeDefined();
    });

    it('should allow owner to cancel a confirmed booking', async () => {
      // Seed a fresh confirmed booking
      await seedAdminData('restaurants/rest-1/bookings/bk-cancel', VALID_BOOKING);
      await expect(
        updateDoc(doc(user1Db, 'restaurants/rest-1/bookings/bk-cancel'), {
          status: 'cancelled',
        })
      ).resolves.toBeUndefined();
    });

    it('should deny owner cancelling an already-cancelled booking', async () => {
      await seedAdminData('restaurants/rest-1/bookings/bk-already-cancelled', {
        ...VALID_BOOKING,
        status: 'cancelled',
      });
      await expect(
        updateDoc(doc(user1Db, 'restaurants/rest-1/bookings/bk-already-cancelled'), {
          status: 'cancelled',
        })
      ).rejects.toThrow();
    });

    it('should deny non-owner updating booking', async () => {
      await expect(
        updateDoc(doc(user2Db, 'restaurants/rest-1/bookings/bk-1'), {
          status: 'cancelled',
        })
      ).rejects.toThrow();
    });

    it('should deny delete', async () => {
      await expect(
        deleteDoc(doc(user1Db, 'restaurants/rest-1/bookings/bk-1'))
      ).rejects.toThrow();
    });
  });
});
