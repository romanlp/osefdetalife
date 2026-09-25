import { test, expect } from '../fixtures';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  deleteField,
  setDoc,
  where,
} from 'firebase/firestore';
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

/**
 * AC6 evidence — WCAG 2.x contrast ratio for an element's text against the first
 * opaque ancestor background. Computed in the browser so the real cascade
 * (including white-label CSS custom properties) decides both colours.
 */
async function contrastRatio(locator: import('@playwright/test').Locator): Promise<number> {
  return locator.first().evaluate((element) => {
    const toRgb = (value: string): [number, number, number] => {
      const parts = value.match(/[\d.]+/g) ?? [];
      return [Number(parts[0]), Number(parts[1]), Number(parts[2])];
    };
    const luminance = ([r, g, b]: [number, number, number]): number => {
      const channel = (value: number) => {
        const srgb = value / 255;
        return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };

    let background: [number, number, number] | null = null;
    for (let node: Element | null = element; node; node = node.parentElement) {
      const value = getComputedStyle(node).backgroundColor;
      if (value && !value.includes('rgba(0, 0, 0, 0)') && !value.includes('transparent')) {
        background = toRgb(value);
        break;
      }
    }
    if (!background) throw new Error('No opaque ancestor background for contrast check');

    const [lighter, darker] = [
      luminance(toRgb(getComputedStyle(element).color)),
      luminance(background),
    ].sort((a, b) => b - a);
    return (lighter + 0.05) / (darker + 0.05);
  });
}

/** AC6: body copy must clear the WCAG 2.1 AA 4.5:1 minimum. */
async function expectContrastAtLeast(
  locator: import('@playwright/test').Locator,
  label: string,
  minimum = 4.5,
): Promise<void> {
  const ratio = await contrastRatio(locator);
  expect(ratio, `${label} contrast ratio`).toBeGreaterThanOrEqual(minimum);
}

/** AC6: every interactive control renders at least 44×44 CSS px. */
async function expectMinTapTarget(
  locator: import('@playwright/test').Locator,
  label: string,
): Promise<void> {
  const box = await locator.first().boundingBox();
  expect(box, `${label} has no layout box`).not.toBeNull();
  // Sub-pixel tolerance: a 44px rule can measure 43.99998 after layout rounding,
  // which is not a smaller target — a real violation is off by a whole pixel.
  const tolerance = 0.5;
  expect(box!.width, `${label} width`).toBeGreaterThanOrEqual(44 - tolerance);
  expect(box!.height, `${label} height`).toBeGreaterThanOrEqual(44 - tolerance);
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

    test('[P0] book → party size → date → pick a slot → live details step', async ({
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

      // Slot pick auto-advances to the live details step.
      await expect(page.getByTestId('details-step')).toBeVisible();
      await expect(page.getByTestId('step-announcement')).toHaveText('Step 5 of 6: Details');
      await expect(page.getByTestId('details-submit')).toHaveText('Confirm Booking');

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

    test('[P0] full back chain keeps every selection and restores typed details', async ({
      page,
      restaurant,
    }) => {
      await startBooking(page, restaurant.slug);
      await page.getByTestId('party-size-option-3').click();

      const target = nextFutureOpenDate(restaurant);
      await showMonth(page, target);
      await page.getByTestId(`date-option-${target}`).click();

      const step = page.getByTestId('time-slot-step');
      await expect(step).toBeVisible();
      const slotId = expectedFreeSlots(restaurant, target)[0];
      await page.getByTestId(slotId).click();

      // Type into the live details step, then walk the whole chain back.
      await expect(page.getByTestId('details-step')).toBeVisible();
      await page.getByTestId('details-name').fill('Jane Doe');
      await page.getByTestId('details-email').fill('jane@example.com');

      await page.getByTestId('details-back').click();
      await expect(page.getByTestId(slotId)).toHaveAttribute('aria-pressed', 'true');

      await page.getByTestId('time-back').click();
      await expect(page.getByTestId(`date-option-${target}`)).toHaveAttribute(
        'aria-pressed',
        'true',
      );

      await page.getByTestId('calendar-back').click();
      await expect(page.getByTestId('party-size-option-3')).toHaveAttribute('aria-pressed', 'true');

      // Forward again along the same selections…
      await page.getByTestId('party-size-option-3').click();
      await expect(page.getByTestId('calendar-step')).toBeVisible();
      await page.getByTestId(`date-option-${target}`).click();
      await expect(step).toBeVisible();
      await page.getByTestId(slotId).click();

      // …and the typed details are still there (2.4's filed deferral).
      await expect(page.getByTestId('details-step')).toBeVisible();
      await expect(page.getByTestId('details-name')).toHaveValue('Jane Doe');
      await expect(page.getByTestId('details-email')).toHaveValue('jane@example.com');
      await expect(page.getByTestId('step-announcement')).toHaveText('Step 5 of 6: Details');
      // Focus lands on the incoming step's heading, not the first control.
      await expect(page.locator('[data-testid="details-step"] h2')).toBeFocused();
    });

    test('[P1] details open empty when a different slot is chosen after back', async ({
      page,
      restaurant,
    }) => {
      await startBooking(page, restaurant.slug);
      await page.getByTestId('party-size-option-2').click();

      const target = nextFutureOpenDate(restaurant);
      await showMonth(page, target);
      await page.getByTestId(`date-option-${target}`).click();

      await expect(page.getByTestId('time-slot-step')).toBeVisible();
      const slots = expectedFreeSlots(restaurant, target);
      expect(slots.length).toBeGreaterThan(1);
      await page.getByTestId(slots[0]).click();

      await expect(page.getByTestId('details-step')).toBeVisible();
      await page.getByTestId('details-name').fill('Jane Doe');

      // A different slot is a new booking intent — the draft goes with the old one.
      await page.getByTestId('details-back').click();
      await page.getByTestId(slots[1]).click();

      await expect(page.getByTestId('details-step')).toBeVisible();
      await expect(page.getByTestId('details-name')).toHaveValue('');
    });

    test('[P0] page-level Firestore failure shows the exact message and retry recovers', async ({
      page,
      restaurant,
    }) => {
      const firestoreOrigin = '**/localhost:8081/**';
      await page.route(firestoreOrigin, (route) => route.abort('connectionrefused'));

      await page.goto(`/book/${restaurant.slug}`);

      const alert = page.getByTestId('booking-page-error');
      await expect(alert).toBeVisible({ timeout: 20_000 });
      await expect(alert).toContainText('Something went wrong. Please try again.');
      await expect(page.getByTestId('retry-button')).toBeVisible();
      // No flow is initiated while the lookup is failing.
      await expect(page.getByTestId('book-button')).toHaveCount(0);
      await expectContrastAtLeast(alert.locator('p'), 'page error message');

      // Retry re-runs the lookup once the network is back.
      await page.unroute(firestoreOrigin);
      await page.getByTestId('retry-button').click();

      await expect(page.getByTestId('restaurant-name')).toHaveText(restaurant.name, {
        timeout: 20_000,
      });
    });

    test('[P1] every interactive control meets the 44px tap-target minimum', async ({
      page,
      restaurant,
    }) => {
      await page.goto(`/book/${restaurant.slug}`);

      await expect(page.getByTestId('book-button')).toBeVisible();
      await expectMinTapTarget(page.getByTestId('book-button'), 'book-button');
      await page.getByTestId('book-button').click();

      await expect(page.getByTestId('party-size-option-1')).toBeVisible();
      await expectMinTapTarget(page.getByTestId('party-size-option-1'), 'party-size-option-1');
      await expectMinTapTarget(page.getByTestId('party-size-back'), 'party-size-back');
      await page.getByTestId('party-size-option-2').click();

      const target = nextFutureOpenDate(restaurant);
      await expect(page.getByTestId('calendar-step')).toBeVisible();
      await expectMinTapTarget(page.getByTestId('calendar-prev'), 'calendar-prev');
      await expectMinTapTarget(page.getByTestId('calendar-next'), 'calendar-next');
      await expectMinTapTarget(page.getByTestId('calendar-back'), 'calendar-back');
      await showMonth(page, target);
      await expectMinTapTarget(page.getByTestId(`date-option-${target}`), `date-option-${target}`);
      await page.getByTestId(`date-option-${target}`).click();

      await expect(page.getByTestId('time-slot-step')).toBeVisible();
      const slotId = expectedFreeSlots(restaurant, target)[0];
      await expectMinTapTarget(page.getByTestId(slotId), slotId);
      await expectMinTapTarget(page.getByTestId('time-back'), 'time-back');
      await page.getByTestId(slotId).click();

      await expect(page.getByTestId('details-step')).toBeVisible();
      await expectMinTapTarget(page.getByTestId('details-name'), 'details-name');
      await expectMinTapTarget(page.getByTestId('details-email'), 'details-email');
      await expectMinTapTarget(page.getByTestId('details-submit'), 'details-submit');
      await expectMinTapTarget(page.getByTestId('details-back'), 'details-back');
    });

    test('[P1] platform text meets WCAG AA contrast on landing, party size and details', async ({
      page,
      restaurant,
    }) => {
      await page.goto(`/book/${restaurant.slug}`);

      await expect(page.getByTestId('restaurant-name')).toBeVisible();
      await expectContrastAtLeast(page.getByTestId('restaurant-name'), 'restaurant name');
      await expectContrastAtLeast(page.getByTestId('restaurant-address'), 'restaurant address');

      await page.getByTestId('book-button').click();
      await expect(page.getByTestId('party-size-option-1')).toBeVisible();
      await expectContrastAtLeast(page.locator('.heading'), 'party size heading');
      await expectContrastAtLeast(page.locator('.subheading'), 'party size subheading');

      await page.getByTestId('party-size-option-2').click();
      const target = nextFutureOpenDate(restaurant);
      await showMonth(page, target);
      await page.getByTestId(`date-option-${target}`).click();

      await expect(page.getByTestId('time-slot-step')).toBeVisible();
      await page.getByTestId(expectedFreeSlots(restaurant, target)[0]).click();

      await expect(page.getByTestId('details-step')).toBeVisible();
      await expectContrastAtLeast(page.locator('label[for="details-name-input"]'), 'name label');
      await expectContrastAtLeast(page.locator('label[for="details-email-input"]'), 'email label');
      await expectContrastAtLeast(page.getByTestId('details-name'), 'name input text');
    });

    test('[P0] happy-path submit writes booking + projection, lands on confirmation', async ({
      page,
      db,
      restaurant,
    }) => {
      await startBooking(page, restaurant.slug);
      await page.getByTestId('party-size-option-3').click();

      const nextOpenDate = nextFutureOpenDate(restaurant);
      await showMonth(page, nextOpenDate);
      await page.getByTestId(`date-option-${nextOpenDate}`).click();

      const freeSlots = expectedFreeSlots(restaurant, nextOpenDate);
      expect(freeSlots.length).toBeGreaterThan(0);
      const firstSlotId = freeSlots[0];
      const firstSlotTime = firstSlotId.replace('time-option-', '').replace('-', ':');
      await page.getByTestId(firstSlotId).click();

      await page.getByTestId('details-name').fill('Jane Doe');
      await page.getByTestId('details-email').fill('jane@example.com');
      await expect(page.getByTestId('details-custom')).toHaveCount(0);

      await page.getByTestId('details-submit').click();

      await expect(page.getByTestId('confirmation')).toBeVisible();
      await expect(page.getByTestId('step-announcement')).toHaveText('Step 6 of 6: Confirmation');
      await expect(page.getByText("You're all set.")).toBeVisible();
      const summary = await page.getByTestId('confirmation-summary').textContent();
      expect(summary).toContain(nextOpenDate);
      expect(summary).toContain(firstSlotTime);
      await expect(page.getByTestId('details-submit')).toHaveCount(0);
      await expect(page.getByTestId('details-back')).toHaveCount(0);

      const bookingsSnap = await getDocs(
        query(
          collection(db, 'restaurants', restaurant.id, 'bookings'),
          where('email', '==', 'jane@example.com'),
        ),
      );
      expect(bookingsSnap.docs).toHaveLength(1);
      const booking = bookingsSnap.docs[0].data();
      expect(booking).toMatchObject({
        restaurantId: restaurant.id,
        date: nextOpenDate,
        time: firstSlotTime,
        partySize: 3,
        name: 'Jane Doe',
        status: 'confirmed',
        duration: 120,
      });
      expect(booking).not.toHaveProperty('customFieldValue');

      const projectionSnap = await getDoc(
        doc(db, 'restaurants', restaurant.id, 'bookings-public', bookingsSnap.docs[0].id),
      );
      expect(projectionSnap.exists()).toBe(true);
      expect(projectionSnap.data()).toEqual({
        restaurantId: restaurant.id,
        date: nextOpenDate,
        time: firstSlotTime,
        partySize: 3,
        status: 'confirmed',
      });

      const projectId = 'firebase-crackling-fire-4704';
      for (const coll of ['bookings', 'bookings-public']) {
        await fetch(
          `http://localhost:8081/emulator/v1/projects/${projectId}/databases/(default)/documents/restaurants/${restaurant.id}/${coll}/${bookingsSnap.docs[0].id}`,
          { method: 'DELETE' },
        );
      }
    });

    test('[P1] required custom field blocks submit until filled', async ({
      page,
      db,
      restaurant,
    }) => {
      await updateDoc(doc(db, 'restaurants', restaurant.id), {
        customField: { label: 'Allergies', required: true, enabled: true },
      });

      try {
        await startBooking(page, restaurant.slug);
        await page.getByTestId('party-size-option-2').click();

        const nextOpenDate = nextFutureOpenDate(restaurant);
        await showMonth(page, nextOpenDate);
        await page.getByTestId(`date-option-${nextOpenDate}`).click();

        const freeSlots = expectedFreeSlots(restaurant, nextOpenDate);
        await page.getByTestId(freeSlots[0]).click();

        await expect(page.getByTestId('details-custom')).toBeVisible();
        await page.getByTestId('details-name').fill('Jane Doe');
        await page.getByTestId('details-email').fill('jane@example.com');
        await page.getByTestId('details-submit').click();

        await expect(page.getByText('This field is required.')).toBeVisible();

        await page.getByTestId('details-custom').fill('Peanuts');
        await page.getByTestId('details-submit').click();
        await expect(page.getByTestId('confirmation')).toBeVisible();
      } finally {
        await updateDoc(doc(db, 'restaurants', restaurant.id), {
          customField: deleteField(),
        });
      }
    });

    test('[P1] optional custom field submits empty', async ({ page, db, restaurant }) => {
      await updateDoc(doc(db, 'restaurants', restaurant.id), {
        customField: { label: 'Occasion', required: false, enabled: true },
      });

      try {
        await startBooking(page, restaurant.slug);
        await page.getByTestId('party-size-option-2').click();

        const nextOpenDate = nextFutureOpenDate(restaurant);
        await showMonth(page, nextOpenDate);
        await page.getByTestId(`date-option-${nextOpenDate}`).click();

        const freeSlots = expectedFreeSlots(restaurant, nextOpenDate);
        await page.getByTestId(freeSlots[0]).click();

        await page.getByTestId('details-name').fill('Jane Doe');
        await page.getByTestId('details-email').fill('jane@example.com');
        await page.getByTestId('details-submit').click();

        await expect(page.getByTestId('confirmation')).toBeVisible();
      } finally {
        await updateDoc(doc(db, 'restaurants', restaurant.id), {
          customField: deleteField(),
        });
      }
    });


  });
});
