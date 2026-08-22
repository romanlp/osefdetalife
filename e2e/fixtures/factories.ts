import { faker } from '@faker-js/faker';
import type { Restaurant, TableGroup, Booking, User } from './types';

export function createRestaurantData(overrides?: Partial<Restaurant>): Restaurant {
  const id = faker.string.uuid();
  return {
    id,
    name: faker.company.name(),
    slug: `test-restaurant-${id.slice(0, 8)}`,
    address: faker.location.streetAddress(),
    ownerId: faker.string.uuid(),
    timezone: 'Europe/London',
    hours: {
      // ISO day numbers: 1=Monday .. 7=Sunday (matches the app's OpeningHours type).
      // Saturday (6) is intentionally closed so calendar e2e can assert hidden days.
      1: { open: '09:00', close: '17:00' },
      2: { open: '09:00', close: '17:00' },
      3: { open: '09:00', close: '17:00' },
      4: { open: '09:00', close: '17:00' },
      5: { open: '10:00', close: '15:00' },
      7: { open: '09:00', close: '17:00' },
    },
    whiteLabel: {
      primaryColor: '#1A1A1A',
      secondaryColor: '#8FA67A',
    },
    ...overrides,
  };
}

export function createTableGroupData(restaurantId: string, overrides?: Partial<TableGroup>): TableGroup {
  return {
    id: faker.string.uuid(),
    restaurantId,
    capacity: faker.number.int({ min: 2, max: 8 }),
    count: faker.number.int({ min: 1, max: 5 }),
    ...overrides,
  };
}

export function createBookingData(restaurantId: string, overrides?: Partial<Booking>): Booking {
  const date = faker.date.future();
  return {
    id: faker.string.uuid(),
    restaurantId,
    date: date.toISOString().split('T')[0],
    time: `${faker.number.int({ min: 9, max: 17 })}:00`,
    partySize: faker.number.int({ min: 1, max: 8 }),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    status: 'confirmed',
    createdAt: new Date(),
    ...overrides,
  };
}

export function createUserData(overrides?: Partial<User>): User {
  return {
    uid: faker.string.uuid(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    ...overrides,
  };
}
