import { test, expect } from '../fixtures';
import { collection, doc, getDoc, updateDoc, deleteField, setDoc } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { Restaurant } from '../fixtures/types';

/** Next Saturday on/after today in `timezone`, as YYYY-MM-DD — the seeded restaurant is closed Saturdays. */
function nextClosedDayIso(timezone: string): string {
  const now = new Date();
  const todayIso = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  let [year, month, day] = todayIso.split('-').map(Number);
  for (let i = 0; i < 13; i++) {
    const utcDayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    if (utcDayOfWeek === 6) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    const next = new Date(Date.UTC(year, month - 1, day + 1));
    year = next.getUTCFullYear();
    month = next.getUTCMonth() + 1;
    day = next.getUTCDate();
  }
  throw new Error('No Saturday found within two weeks');
}

/** The calendar's month label for an ISO date — matches the app's en-GB "Month YYYY" rendering. */
function monthLabel(iso: string): string {
  const [year, month] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    month: 'long',
    year: 'numeric',
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

/**
 * First open date STRICTLY AFTER today in `timezone`, as YYYY-MM-DD. A future
 * date keeps the time step's now-filter out of the test so pill expectations
 * never depend on when in the day the suite runs.
 */
function nextFutureOpenDate(restaurant: Restaurant): string {
  const todayIso = new Intl.DateTimeFormat('en-CA', {
    timeZone: restaurant.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  let [year, month, day] = todayIso.split('-').map(Number);
  for (let i = 0; i < 366; i++) {
    const next = new Date(Date.UTC(year, month - 1, day + 1));
    year = next.getUTCFullYear();
    month = next.getUTCMonth() + 1;
    day = next.getUTCDate();
    const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const utcDayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    const dayNumber = ((utcDayOfWeek + 6) % 7) + 1;
    if (restaurant.hours[dayNumber]) return iso;
  }
  throw new Error('No open day found within a year');
}

/** Seeds one confirmed bookings-public projection (under the restaurant) and returns its cleanup handle. */
async function seedProjection(
  db: Firestore,
  restaurantId: string,
  date: string,
  time: string,
  partySize: number,
): Promise<() => Promise<void>> {
  const id = crypto.randomUUID();
  const ref = doc(collection(db, 'restaurants', restaurantId, 'bookings-public'), id);
  await setDoc(ref, { restaurantId, date, time, partySize, status: 'confirmed' });
  return async () => {
    // Rules block delete on the projection (allow delete: if false); bypass via the
    // emulator's admin endpoint, mirroring clearFirestore().
    const response = await fetch(
      `http://localhost:8081/emulator/v1/projects/firebase-crackling-fire-4704/databases/(default)/documents/restaurants/${restaurantId}/bookings-public/${id}`,
      { method: 'DELETE' },
    );
    if (!response.ok) {
      console.warn('Failed to delete seeded projection:', response.statusText);
    }
  };
}

/**
 * The free-day availability the app must render for one open date: every
 * 15-minute start whose 120-minute dining window ends ≤ close, formatted as
 * pill testids. Mirrors the app's rule so tests never hardcode a weekday.
 */
function expectedFreeSlots(restaurant: Restaurant, iso: string): string[] {
  const [year, month, day] = iso.split('-').map(Number);
  const utcDayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const dayNumber = ((utcDayOfWeek + 6) % 7) + 1;
  const dayHours = restaurant.hours[dayNumber];
  if (!dayHours) return [];

  const [openH, openM] = dayHours.open.split(':').map(Number);
  const [closeH, closeM] = dayHours.close.split(':').map(Number);
  const openMin = openH * 60 + openM;
  const closeMin = closeH * 60 + closeM;

  const slots: string[] = [];
  for (let m = openMin; m <= closeMin; m += 15) {
    if (m + 120 > closeMin) continue;
    slots.push(`time-option-${String(Math.floor(m / 60)).padStart(2, '0')}-${String(m % 60).padStart(2, '0')}`);
  }
  return slots;
}

test.describe('Public Booking Page', () => {
  test('[P0] valid slug renders restaurant name, address, and Book a Table button', async ({
    page,
    db,
    restaurant,
  }) => {
    const slugDoc = await getDoc(doc(db, 'slugs', restaurant.slug));
    expect(slugDoc.exists()).toBe(true);
    expect(slugDoc.data()?.restaurantId).toBe(restaurant.id);

    await page.goto(`/book/${restaurant.slug}`);

    await expect(page.getByTestId('restaurant-name')).toHaveText(restaurant.name);
    await expect(page.getByTestId('restaurant-address')).toHaveText(restaurant.address);
    await expect(page.getByTestId('book-button')).toBeVisible();
    await expect(page.getByTestId('book-button')).toHaveText('Book a Table');
  });

  test('[P1] invalid slug shows "Restaurant not found"', async ({ page }) => {
    await page.goto('/book/definitely-not-a-real-slug');

    await expect(page.getByText('Restaurant not found')).toBeVisible();
    await expect(page.getByTestId('book-button')).toHaveCount(0);
  });

  test('[P1] address element is hidden when restaurant has no address', async ({
    page,
    db,
    restaurant,
  }) => {
    await updateDoc(doc(db, 'restaurants', restaurant.id), {
      address: deleteField(),
    });

    await page.goto(`/book/${restaurant.slug}`);

    await expect(page.getByTestId('restaurant-name')).toHaveText(restaurant.name);
    await expect(page.getByTestId('restaurant-address')).toHaveCount(0);
    await expect(page.getByTestId('book-button')).toBeVisible();
  });

  test.describe('Booking Flow', () => {
    async function startBooking(page: import('@playwright/test').Page, slug: string) {
      await page.goto(`/book/${slug}`);
      await expect(page.getByTestId('book-button')).toBeVisible();
      await page.getByTestId('book-button').click();
      await expect(page.getByRole('heading', { name: 'How many guests?' })).toBeVisible();
    }

    /**
     * Forwards the calendar until the month containing `iso` is rendered. The
     * grid only shows one month at a time, so any assertion about a date must
     * first bring its month on screen — otherwise near month boundaries the
     * target simply does not exist in the DOM yet.
     */
    async function showMonth(page: import('@playwright/test').Page, iso: string): Promise<void> {
      const target = monthLabel(iso);
      for (let i = 0; i < 24; i++) {
        const label = (await page.locator('.month-label').textContent())?.trim();
        if (label === target) return;
        await page.getByTestId('calendar-next').click();
      }
      throw new Error(`Month "${target}" never rendered within 24 forward navigations`);
    }

    test('[P0] book → party size → date → pick a slot → details placeholder', async ({
      page,
      restaurant,
    }) => {
      await startBooking(page, restaurant.slug);

      await page.getByTestId('party-size-option-3').click();

      const nextOpenDate = nextFutureOpenDate(restaurant);
      // The next open date can fall beyond the currently displayed month.
      await showMonth(page, nextOpenDate);
      await expect(page.getByTestId(`date-option-${nextOpenDate}`)).toBeVisible();
      await page.getByTestId(`date-option-${nextOpenDate}`).click();

      // With seeded tables (cap-2 ×2 / cap-4 ×3 / cap-6 ×1) all free, every
      // window-fitting slot for the day's hours must render as a pill.
      const step = page.getByTestId('time-slot-step');
      await expect(step).toBeVisible();
      const freeSlots = expectedFreeSlots(restaurant, nextOpenDate);
      expect(freeSlots.length).toBeGreaterThan(0);
      await expect(step.locator('.pill')).toHaveCount(freeSlots.length);
      await expect(page.getByTestId(freeSlots[0])).toBeVisible();
      await expect(page.getByTestId(freeSlots.at(-1)!)).toBeVisible();

      const firstSlotId = freeSlots[0];
      await page.getByTestId(firstSlotId).click();

      // Slot pick auto-advances to the placeholder details step.
      await expect(page.getByTestId('details-placeholder')).toBeVisible();
      await expect(page.getByTestId('step-announcement')).toHaveText('Step 5 of 6: Details');

      // Back restores time with the slot highlighted and selections intact.
      await page.getByTestId('details-back').click();
      await expect(step).toBeVisible();
      const picked = page.getByTestId(firstSlotId);
      await expect(picked).toHaveAttribute('aria-pressed', 'true');
      await expect(picked).toHaveClass(/selected/);

      await page.getByTestId('time-back').click();
      await expect(page.getByTestId('calendar-step')).toBeVisible();
      await expect(page.getByTestId(`date-option-${nextOpenDate}`)).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });

    test('[P1] occupied window: a confirmed projection removes overlapping six-top slots', async ({
      page,
      db,
      restaurant,
    }) => {
      const target = nextFutureOpenDate(restaurant);
      // Party of 6 → only the single cap-6 table qualifies; booked 10:30–12:30.
      const cleanup = await seedProjection(db, restaurant.id, target, '10:30', 6);

      try {
        await startBooking(page, restaurant.slug);
        await page.getByTestId('party-size-option-6').click();

        await showMonth(page, target);
        await page.getByTestId(`date-option-${target}`).click();

        const step = page.getByTestId('time-slot-step');
        await expect(step).toBeVisible();
        // Every slot overlapping [10:30, 12:30) is gone for this party size —
        // the grid never starts before 09:00, so all pre-12:30 slots are gone.
        await expect(page.getByTestId('time-option-10-00')).toHaveCount(0);
        await expect(page.getByTestId('time-option-10-30')).toHaveCount(0);
        await expect(page.getByTestId('time-option-11-30')).toHaveCount(0);
        await expect(page.getByTestId('time-option-12-15')).toHaveCount(0);
        // …while 12:30 (booking ends) and 13:00 (valid on every fixture day) stay bookable.
        await expect(page.getByTestId('time-option-12-30')).toBeVisible();
        await expect(page.getByTestId('time-option-13-00')).toBeVisible();
      } finally {
        await cleanup();
      }
    });

    test('[P1] no available times shows the empty message with back as the only way forward', async ({
      page,
      db,
      restaurant,
    }) => {
      const target = nextFutureOpenDate(restaurant);
      // Sole cap-6 table booked back-to-back 10:00→16:00 covers every candidate slot.
      const cleanups = [
        await seedProjection(db, restaurant.id, target, '10:00', 6),
        await seedProjection(db, restaurant.id, target, '12:00', 6),
        await seedProjection(db, restaurant.id, target, '14:00', 6),
      ];

      try {
        await startBooking(page, restaurant.slug);
        await page.getByTestId('party-size-option-6').click();

        await showMonth(page, target);
        await page.getByTestId(`date-option-${target}`).click();

        const step = page.getByTestId('time-slot-step');
        await expect(step).toBeVisible();
        await expect(page.getByTestId('time-empty')).toHaveText(
          'No available times for this date.',
        );
        await expect(step.locator('.pill')).toHaveCount(0);

        // Back remains the only navigation.
        await page.getByTestId('time-back').click();
        await expect(page.getByTestId('calendar-step')).toBeVisible();
      } finally {
        for (const cleanup of cleanups) {
          await cleanup();
        }
      }
    });

    test('[P1] back from the calendar preserves the chosen party size', async ({
      page,
      restaurant,
    }) => {
      await startBooking(page, restaurant.slug);

      await page.getByTestId('party-size-option-4').click();
      await expect(page.getByTestId('calendar-back')).toBeVisible();

      await page.getByTestId('calendar-back').click();

      const option = page.getByTestId('party-size-option-4');
      await expect(option).toBeVisible();
      await expect(option).toHaveClass(/selected/);
      await expect(option).toHaveAttribute('aria-pressed', 'true');
    });

    test('[P1] closed weekday is absent from its own rendered month and navigation still works', async ({
      page,
      restaurant,
    }) => {
      await startBooking(page, restaurant.slug);

      await page.getByTestId('party-size-option-2').click();

      const closedDay = nextClosedDayIso(restaurant.timezone);
      // Render the closed day's month first — a toHaveCount(0) against an
      // undisplayed month would pass vacuously and prove nothing.
      await showMonth(page, closedDay);
      await expect(page.getByTestId(`date-option-${closedDay}`)).toHaveCount(0);

      // Month navigation still works alongside hidden days.
      await page.getByTestId('calendar-next').click();
      await expect(page.getByTestId('calendar-prev')).toBeEnabled();
      await page.getByTestId('calendar-prev').click();
      await expect(page.locator('.month-label')).toHaveText(monthLabel(closedDay));

      // Back returns to party size with the selection intact.
      await page.getByTestId('calendar-back').click();
      await expect(page.getByTestId('party-size-option-2')).toHaveClass(/selected/);
    });
  });
});
