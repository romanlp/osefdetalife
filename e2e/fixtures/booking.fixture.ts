import { test as base } from '@playwright/test';
import { Firestore, collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '../utils/firebase';
import { createBookingData } from './factories';
import type { Booking } from './types';
import type { FirebaseFixtures } from './firebase.fixture';
import type { RestaurantFixtures } from './restaurant.fixture';

export interface BookingFixtures {
  booking: Booking;
  bookings: Booking[];
}

export const test = base.extend<BookingFixtures & FirebaseFixtures & RestaurantFixtures>({
  booking: async ({ db, restaurant }, use) => {
    const bookingData = createBookingData(restaurant.id);
    const bookingRef = doc(collection(db, 'restaurants', restaurant.id, 'bookings'), bookingData.id);
    await setDoc(bookingRef, bookingData);
    
    await use(bookingData);
    
    await deleteDoc(bookingRef);
  },

  bookings: async ({ db, restaurant }, use) => {
    const bookings = Array.from({ length: 5 }, () => createBookingData(restaurant.id));
    
    for (const booking of bookings) {
      const bookingRef = doc(collection(db, 'restaurants', restaurant.id, 'bookings'), booking.id);
      await setDoc(bookingRef, booking);
    }
    
    await use(bookings);
    
    for (const booking of bookings) {
      const bookingRef = doc(collection(db, 'restaurants', restaurant.id, 'bookings'), booking.id);
      await deleteDoc(bookingRef);
    }
  },
});

export { expect } from '@playwright/test';
