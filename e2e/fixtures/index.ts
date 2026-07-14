import { mergeTests } from '@playwright/test';
import { test as firebase } from './firebase.fixture';
import { test as restaurant } from './restaurant.fixture';
import { test as booking } from './booking.fixture';
import { test as auth } from './auth.fixture';

export const test = mergeTests(firebase, restaurant, booking, auth);
export { expect } from '@playwright/test';
