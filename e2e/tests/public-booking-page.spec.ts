import { test, expect } from '../fixtures';
import { doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import { getNextAvailableDate } from '../utils/test-helpers';

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

    test('[P0] book → choose party size → pick next open date → time-slot stub shows summary', async ({
      page,
      restaurant,
    }) => {
      await startBooking(page, restaurant.slug);

      await page.getByTestId('party-size-option-3').click();

      const nextOpenDate = getNextAvailableDate(restaurant.hours, restaurant.timezone);
      // The next open date can fall beyond the currently displayed month.
      await showMonth(page, nextOpenDate);
      await expect(page.getByTestId(`date-option-${nextOpenDate}`)).toBeVisible();
      await page.getByTestId(`date-option-${nextOpenDate}`).click();

      const stub = page.getByTestId('time-slot-stub');
      await expect(stub).toBeVisible();
      await expect(stub).toContainText('Party size: 3');
      // The chosen ISO date is exposed machine-readably in the summary.
      await expect(
        page.getByTestId('booking-summary').locator('time'),
      ).toHaveAttribute('datetime', nextOpenDate);
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
