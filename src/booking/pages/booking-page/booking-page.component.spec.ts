import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BookingPageComponent } from './booking-page.component';
import { BookingService } from '../../services/booking.service';
import { BookingFlowService } from '../../services/booking-flow.service';
import { NOW } from '../../utils/clock';
import type { Restaurant } from '../../../shared/types/restaurant';

const RESTAURANT_FIXTURE: Restaurant = {
  id: 'rest-123',
  name: 'The Blue Bistro',
  slug: 'the-blue-bistro',
  address: '42 Rue de Rivoli, Paris',
  ownerId: 'user-1',
  timezone: 'Europe/London',
  hours: {},
  tableGroups: [],
  whiteLabel: { primaryColor: '#C0392B', secondaryColor: '#27AE60' },
  onboardingCompleted: true,
  createdAt: new Date('2026-01-01T00:00:00Z'),
};

/** Open every day — combined with the fixed clock (Thu 2026-08-20) the calendar is deterministic. */
const RESTAURANT_OPEN_ALL_WEEK: Restaurant = {
  ...RESTAURANT_FIXTURE,
  hours: {
    1: { open: '09:00', close: '17:00' },
    2: { open: '09:00', close: '17:00' },
    3: { open: '09:00', close: '17:00' },
    4: { open: '09:00', close: '17:00' },
    5: { open: '09:00', close: '17:00' },
    6: { open: '09:00', close: '17:00' },
    7: { open: '09:00', close: '17:00' },
  },
  tableGroups: [
    { capacity: 2, count: 2 },
    { capacity: 4, count: 3 },
    { capacity: 6, count: 1 },
  ],
};

/** Thursday 2026-08-20 at 23:30 UTC — already Friday Aug 21 in Europe/London. */
const FIXED_NOW = () => new Date('2026-08-20T23:30:00Z');

/**
 * Simulates a Firestore doc missing hours/timezone at runtime (both fields are
 * required by the Restaurant type, so they are stripped post-construction).
 */
const BROKEN_RESTAURANT: Restaurant = (() => {
  const partial = { ...RESTAURANT_OPEN_ALL_WEEK } as Record<string, unknown>;
  delete partial['hours'];
  delete partial['timezone'];
  return partial as unknown as Restaurant;
})();

describe('BookingPageComponent', () => {
  let fixture: ComponentFixture<BookingPageComponent>;
  let bookingServiceSpy: {
    getRestaurantBySlug: ReturnType<typeof vi.fn>;
    getPublicBookings: ReturnType<typeof vi.fn>;
  };

  function queryEl(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(async () => {
    bookingServiceSpy = {
      getRestaurantBySlug: vi.fn(),
      // Availability reads succeed by default; cases override per scenario.
      getPublicBookings: vi.fn().mockResolvedValue([]),
    };

    await TestBed.configureTestingModule({
      imports: [BookingPageComponent],
      providers: [
        provideRouter([]),
        { provide: BookingService, useValue: bookingServiceSpy },
        { provide: NOW, useValue: FIXED_NOW },
      ],
    }).compileComponents();
  });

  async function createComponent(slug?: string): Promise<void> {
    fixture = TestBed.createComponent(BookingPageComponent);
    if (slug) {
      fixture.componentRef.setInput('slug', slug);
    }
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  /** Loads the page with a successfully resolved restaurant, ready for flow interactions. */
  async function createLoadedComponent(restaurant: Restaurant = RESTAURANT_FIXTURE): Promise<void> {
    bookingServiceSpy.getRestaurantBySlug.mockResolvedValue(restaurant);
    await createComponent('the-blue-bistro');
  }

  function bookButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('[data-testid="book-button"]');
  }

  describe('HAPPY_PATH', () => {
    it('[P0] should show a loading spinner then render name, address, and Book a Table button', async () => {
      let resolveLoad!: (value: Restaurant | null) => void;
      bookingServiceSpy.getRestaurantBySlug.mockReturnValue(
        new Promise<Restaurant | null>((resolve) => {
          resolveLoad = resolve;
        }),
      );
      await createComponent();

      fixture.componentRef.setInput('slug', 'the-blue-bistro');
      fixture.detectChanges();

      const loadingEl = fixture.nativeElement.querySelector('[data-testid="booking-page-loading"]');
      expect(loadingEl).toBeTruthy();
      expect(loadingEl.getAttribute('aria-busy')).toBe('true');

      resolveLoad(RESTAURANT_FIXTURE);
      await fixture.whenStable();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('[data-testid="booking-page-loading"]')).toBeFalsy();
      expect(fixture.nativeElement.querySelector('[data-testid="restaurant-name"]')?.textContent).toContain('The Blue Bistro');
      expect(fixture.nativeElement.querySelector('[data-testid="restaurant-address"]')?.textContent).toContain('42 Rue de Rivoli');
      expect(bookButton()?.textContent).toContain('Book a Table');
    });

    it('[P1] should apply white-label colors as host CSS custom properties', async () => {
      bookingServiceSpy.getRestaurantBySlug.mockResolvedValue(RESTAURANT_FIXTURE);
      await createComponent('the-blue-bistro');

      const host = fixture.nativeElement;
      expect(host.style.getPropertyValue('--osef-brand-primary')).toBe('#C0392B');
      expect(host.style.getPropertyValue('--osef-brand-secondary')).toBe('#27AE60');
    });
  });

  describe('NO_ADDRESS', () => {
    it('[P0] should hide the address element when restaurant has no address', async () => {
      bookingServiceSpy.getRestaurantBySlug.mockResolvedValue({
        ...RESTAURANT_FIXTURE,
        address: undefined,
      });
      await createComponent('the-blue-bistro');

      expect(fixture.nativeElement.querySelector('[data-testid="restaurant-name"]')?.textContent).toContain('The Blue Bistro');
      expect(fixture.nativeElement.querySelector('[data-testid="restaurant-address"]')).toBeFalsy();
      expect(bookButton()).toBeTruthy();
    });
  });

  describe('INVALID_SLUG', () => {
    it('[P0] should show "Restaurant not found" when the slug doc does not exist', async () => {
      bookingServiceSpy.getRestaurantBySlug.mockResolvedValue(null);
      await createComponent('definitely-not-a-real-slug');

      expect(fixture.nativeElement.textContent).toContain('Restaurant not found');
      expect(bookButton()).toBeFalsy();
      expect(fixture.nativeElement.querySelector('[data-testid="retry-button"]')).toBeFalsy();
    });
  });

  describe('RESTAURANT_MISSING', () => {
    it('[P0] should show "Restaurant not found" when the slug exists but the restaurant doc is missing', async () => {
      bookingServiceSpy.getRestaurantBySlug.mockResolvedValue(null);
      await createComponent('stale-slug');

      expect(fixture.nativeElement.textContent).toContain('Restaurant not found');
      expect(bookButton()).toBeFalsy();
    });
  });

  describe('FIREBASE_ERROR', () => {
    it('[P0] should show "Something went wrong. Please try again." with a retry button when getDoc rejects', async () => {
      bookingServiceSpy.getRestaurantBySlug.mockRejectedValue(new Error('network down'));
      await createComponent('the-blue-bistro');

      expect(fixture.nativeElement.textContent).toContain('Something went wrong.');
      expect(fixture.nativeElement.textContent).toContain('Please try again.');
      expect(fixture.nativeElement.querySelector('[data-testid="retry-button"]')).toBeTruthy();
    });

    it('[P0] should re-run the lookup when the retry button is clicked', async () => {
      bookingServiceSpy.getRestaurantBySlug
        .mockRejectedValueOnce(new Error('network down'))
        .mockResolvedValue(RESTAURANT_FIXTURE);
      await createComponent('the-blue-bistro');

      expect(fixture.nativeElement.querySelector('[data-testid="retry-button"]')).toBeTruthy();

      fixture.nativeElement.querySelector('[data-testid="retry-button"]')?.click();
      await fixture.whenStable();

      expect(bookingServiceSpy.getRestaurantBySlug).toHaveBeenCalledTimes(2);
      expect(fixture.nativeElement.querySelector('[data-testid="restaurant-name"]')?.textContent).toContain('The Blue Bistro');
    });
  });

  describe('FLOW_PARTY_SIZE', () => {
    it('[P0] should show the party-size grid when Book a Table is tapped', async () => {
      await createLoadedComponent();

      bookButton().click();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('[data-testid="party-size-step"]')).toBeTruthy();
      expect(fixture.nativeElement.textContent).toContain('How many guests?');
      for (const size of [1, 2, 3, 4, 5, 6, 7, 8]) {
        expect(
          fixture.nativeElement.querySelector(`[data-testid="party-size-option-${size}"]`),
        ).toBeTruthy();
      }
    });

    it('[P0] should return to landing via the party-size back button', async () => {
      await createLoadedComponent();

      bookButton().click();
      fixture.detectChanges();
      queryEl().querySelector<HTMLButtonElement>('[data-testid="party-size-back"]')!.click();
      fixture.detectChanges();

      expect(bookButton()).toBeTruthy();
      expect(fixture.nativeElement.querySelector('[data-testid="party-size-step"]')).toBeFalsy();
    });

    it('[P1] should move focus to the Book a Table button when returning to landing', async () => {
      await createLoadedComponent();

      bookButton().click();
      fixture.detectChanges();
      expect(document.activeElement).not.toBe(bookButton());

      queryEl().querySelector<HTMLButtonElement>('[data-testid="party-size-back"]')!.click();
      fixture.detectChanges();

      expect(document.activeElement).toBe(bookButton());
    });

    it('[P1] should move focus to the party-size heading on transition', async () => {
      await createLoadedComponent();

      bookButton().click();
      fixture.detectChanges();

      const heading = queryEl().querySelector<HTMLHeadingElement>(
        '[data-testid="party-size-step"] h2',
      )!;
      expect(document.activeElement).toBe(heading);
    });

    it('[P1] should announce "Step 2 of 6: Party Size" in the live region', async () => {
      await createLoadedComponent();

      bookButton().click();
      fixture.detectChanges();

      expect(
        fixture.nativeElement.querySelector('[data-testid="step-announcement"]')?.textContent?.trim(),
      ).toBe('Step 2 of 6: Party Size');
    });

    it('[P0] should announce "Step 1 of 6: Start" on landing and again when returning to it', async () => {
      await createLoadedComponent();

      const announcement = () =>
        fixture.nativeElement.querySelector('[data-testid="step-announcement"]')?.textContent?.trim();
      expect(announcement()).toBe('Step 1 of 6: Start');

      bookButton().click();
      fixture.detectChanges();
      expect(announcement()).toBe('Step 2 of 6: Party Size');

      queryEl().querySelector<HTMLButtonElement>('[data-testid="party-size-back"]')!.click();
      fixture.detectChanges();
      expect(announcement()).toBe('Step 1 of 6: Start');
    });
  });

  describe('FLOW_DATE', () => {
    async function reachCalendar(): Promise<void> {
      await createLoadedComponent(RESTAURANT_OPEN_ALL_WEEK);
      bookButton().click();
      fixture.detectChanges();
      queryEl().querySelector<HTMLButtonElement>('[data-testid="party-size-option-4"]')!.click();
      fixture.detectChanges();
    }

    it('[P0] should auto-advance to the calendar after choosing a party size', async () => {
      await reachCalendar();

      expect(fixture.nativeElement.querySelector('[data-testid="calendar-step"]')).toBeTruthy();
      // Fixed clock: "today" is Fri 2026-08-21 in Europe/London; open-all-week renders today onward.
      expect(
        queryEl().querySelector('[data-testid="date-option-2026-08-21"]'),
      ).toBeTruthy();
      expect(
        queryEl().querySelector('[data-testid="date-option-2026-08-20"]'),
      ).toBeFalsy();
    });

    it('[P0] should announce "Step 3 of 6: Date" in the live region', async () => {
      await reachCalendar();

      expect(
        fixture.nativeElement.querySelector('[data-testid="step-announcement"]')?.textContent?.trim(),
      ).toBe('Step 3 of 6: Date');
    });

    it('[P0] should auto-advance to the time-slot step rendering availability pills after picking a date', async () => {
      await reachCalendar();

      queryEl()
        .querySelector<HTMLButtonElement>('[data-testid="date-option-2026-08-21"]')!
        .click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(queryEl().querySelector('[data-testid="time-slot-step"]')).toBeTruthy();
      // Fixed clock is 00:30 London on Fri 2026-08-21 — the whole 09:00–15:00
      // window-fitting range (120-min window ends ≤ 17:00 close) stays bookable.
      expect(
        queryEl().querySelector('[data-testid="time-option-09-00"]'),
      ).toBeTruthy();
      expect(
        queryEl().querySelector('[data-testid="time-option-15-00"]'),
      ).toBeTruthy();
      expect(
        queryEl().querySelector('[data-testid="time-option-15-15"]'),
      ).toBeFalsy();
    });

    it('[P0] should announce "Step 4 of 6: Time" after picking a date', async () => {
      await reachCalendar();

      queryEl()
        .querySelector<HTMLButtonElement>('[data-testid="date-option-2026-08-21"]')!
        .click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(
        fixture.nativeElement.querySelector('[data-testid="step-announcement"]')?.textContent?.trim(),
      ).toBe('Step 4 of 6: Time');
    });

    it('[P1] should move focus to the time-slot heading after picking a date', async () => {
      await reachCalendar();

      queryEl()
        .querySelector<HTMLButtonElement>('[data-testid="date-option-2026-08-21"]')!
        .click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const heading = queryEl().querySelector<HTMLHeadingElement>(
        '[data-testid="time-slot-step"] h2',
      )!;
      expect(document.activeElement).toBe(heading);
    });

    it('[P1] should return to the calendar with the chosen date still highlighted when tapping back on the time step', async () => {
      await reachCalendar();

      queryEl()
        .querySelector<HTMLButtonElement>('[data-testid="date-option-2026-08-21"]')!
        .click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      queryEl().querySelector<HTMLButtonElement>('[data-testid="time-back"]')!.click();
      fixture.detectChanges();

      expect(queryEl().querySelector('[data-testid="calendar-step"]')).toBeTruthy();
      const selected = queryEl().querySelector<HTMLButtonElement>(
        '[data-testid="date-option-2026-08-21"]',
      )!;
      expect(selected.classList.contains('selected')).toBe(true);
      expect(selected.getAttribute('aria-pressed')).toBe('true');
    });

    it('[P1] should show the in-step empty state instead of pills when no slot qualifies', async () => {
      // No table group reaches a party of 8 → nothing can ever qualify.
      bookingServiceSpy.getPublicBookings.mockResolvedValue([]);
      await createLoadedComponent({...RESTAURANT_OPEN_ALL_WEEK, tableGroups: []});
      bookButton().click();
      fixture.detectChanges();
      queryEl().querySelector<HTMLButtonElement>('[data-testid="party-size-option-8"]')!.click();
      fixture.detectChanges();
      queryEl()
        .querySelector<HTMLButtonElement>('[data-testid="date-option-2026-08-21"]')!
        .click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(
        queryEl().querySelector('[data-testid="time-empty"]')?.textContent?.trim(),
      ).toBe('No available times for this date.');
    });

    it('[P0] should show an in-step error with retry when the projections fetch fails, and retry refetches', async () => {
      bookingServiceSpy.getPublicBookings.mockRejectedValue(new Error('offline'));
      await reachCalendar();

      queryEl()
        .querySelector<HTMLButtonElement>('[data-testid="date-option-2026-08-21"]')!
        .click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const step = queryEl().querySelector('[data-testid="time-slot-step"]')!;
      expect(step.textContent).toContain('Something went wrong.');
      expect(step.textContent).toContain('Please try again.');

      bookingServiceSpy.getPublicBookings.mockResolvedValue([]);
      queryEl().querySelector<HTMLButtonElement>('[data-testid="time-retry"]')!.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(bookingServiceSpy.getPublicBookings).toHaveBeenCalledTimes(2);
      expect(queryEl().querySelector('[data-testid="time-retry"]')).toBeFalsy();
      expect(
        queryEl().querySelector('[data-testid="time-option-09-00"]'),
      ).toBeTruthy();
    });

    it('[P0] should render an empty calendar instead of throwing when hours/timezone are missing', async () => {
      await createLoadedComponent(BROKEN_RESTAURANT);

      bookButton().click();
      fixture.detectChanges();
      queryEl().querySelector<HTMLButtonElement>('[data-testid="party-size-option-4"]')!.click();
      fixture.detectChanges();

      expect(queryEl().querySelector('[data-testid="calendar-step"]')).toBeTruthy();
      expect(queryEl().querySelectorAll('.date-btn')).toHaveLength(0);
      expect(
        queryEl().querySelector('[data-testid="calendar-empty"]')?.textContent?.trim(),
      ).toBe('No available dates in this month.');
    });
  });

  describe('FLOW_DETAILS', () => {
    /** Reaches the calendar for Fri 2026-08-21 with party of 4. */
    async function reachCalendar(): Promise<void> {
      await createLoadedComponent(RESTAURANT_OPEN_ALL_WEEK);
      bookButton().click();
      fixture.detectChanges();
      queryEl().querySelector<HTMLButtonElement>('[data-testid="party-size-option-4"]')!.click();
      fixture.detectChanges();
    }

    /** Reaches the time step with pills rendered for Fri 2026-08-21, party of 4. */
    async function reachTimeStep(): Promise<void> {
      await reachCalendar();
      queryEl()
        .querySelector<HTMLButtonElement>('[data-testid="date-option-2026-08-21"]')!
        .click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    }

    it('[P0] should record the slot and auto-advance to the details placeholder', async () => {
      await reachTimeStep();

      queryEl()
        .querySelector<HTMLButtonElement>('[data-testid="time-option-10-00"]')!
        .click();
      fixture.detectChanges();

      expect(fixture.componentInstance.flow.selectedSlot()).toBe('10:00');
      expect(queryEl().querySelector('[data-testid="details-placeholder"]')).toBeTruthy();
      expect(
        queryEl().querySelector('[data-testid="step-announcement"]')?.textContent?.trim(),
      ).toBe('Step 5 of 6: Details');
    });

    it('[P1] should move focus to the details heading on transition', async () => {
      await reachTimeStep();

      queryEl()
        .querySelector<HTMLButtonElement>('[data-testid="time-option-10-00"]')!
        .click();
      fixture.detectChanges();

      const heading = queryEl().querySelector<HTMLHeadingElement>(
        '[data-testid="details-placeholder"] h2',
      )!;
      expect(document.activeElement).toBe(heading);
    });

    it('[P0] should return from details to time with the chosen slot highlighted and all selections intact', async () => {
      await reachTimeStep();

      queryEl()
        .querySelector<HTMLButtonElement>('[data-testid="time-option-10-00"]')!
        .click();
      fixture.detectChanges();
      queryEl().querySelector<HTMLButtonElement>('[data-testid="details-back"]')!.click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(flow().step()).toBe('time');
      const selectedSlot = queryEl().querySelector<HTMLButtonElement>(
        '[data-testid="time-option-10-00"]',
      )!;
      expect(selectedSlot.classList.contains('selected')).toBe(true);
      expect(selectedSlot.getAttribute('aria-pressed')).toBe('true');

      // Time → date: the date selection survives the round trip too.
      queryEl().querySelector<HTMLButtonElement>('[data-testid="time-back"]')!.click();
      fixture.detectChanges();
      const selectedDate = queryEl().querySelector<HTMLButtonElement>(
        '[data-testid="date-option-2026-08-21"]',
      )!;
      expect(selectedDate.classList.contains('selected')).toBe(true);
    });

    function flow(): BookingFlowService {
      return fixture.componentInstance.flow;
    }
  });

  describe('BACK_PRESERVES', () => {
    it('[P0] should preserve the date returning from the stub and the party size returning from the calendar', async () => {
      await createLoadedComponent(RESTAURANT_OPEN_ALL_WEEK);
      bookButton().click();
      fixture.detectChanges();
      queryEl().querySelector<HTMLButtonElement>('[data-testid="party-size-option-4"]')!.click();
      fixture.detectChanges();
      queryEl()
        .querySelector<HTMLButtonElement>('[data-testid="date-option-2026-08-21"]')!
        .click();
      fixture.detectChanges();

      // Stub → calendar: date still highlighted.
      queryEl().querySelector<HTMLButtonElement>('[data-testid="time-back"]')!.click();
      fixture.detectChanges();
      const selectedDate = queryEl().querySelector<HTMLButtonElement>(
        '[data-testid="date-option-2026-08-21"]',
      )!;
      expect(selectedDate.classList.contains('selected')).toBe(true);

      // Calendar → party size: number still highlighted.
      queryEl().querySelector<HTMLButtonElement>('[data-testid="calendar-back"]')!.click();
      fixture.detectChanges();
      const selectedSize = queryEl().querySelector<HTMLButtonElement>(
        '[data-testid="party-size-option-4"]',
      )!;
      expect(selectedSize.classList.contains('selected')).toBe(true);
    });

    it('[P1] should reopen the calendar on a future-month selection with its highlight after tapping back on the stub', async () => {
      await createLoadedComponent(RESTAURANT_OPEN_ALL_WEEK);
      bookButton().click();
      fixture.detectChanges();
      queryEl().querySelector<HTMLButtonElement>('[data-testid="party-size-option-4"]')!.click();
      fixture.detectChanges();

      // Forward two months: August → October, then pick Fri 2026-10-02.
      queryEl().querySelector<HTMLButtonElement>('[data-testid="calendar-next"]')!.click();
      fixture.detectChanges();
      queryEl().querySelector<HTMLButtonElement>('[data-testid="calendar-next"]')!.click();
      fixture.detectChanges();
      expect(queryEl().textContent).toContain('October 2026');
      queryEl()
        .querySelector<HTMLButtonElement>('[data-testid="date-option-2026-10-02"]')!
        .click();
      fixture.detectChanges();

      queryEl().querySelector<HTMLButtonElement>('[data-testid="time-back"]')!.click();
      fixture.detectChanges();

      // The calendar must remount on the selected month — not snap back to August,
      // where the highlighted date does not exist in the DOM at all.
      expect(queryEl().textContent).toContain('October 2026');
      const selected = queryEl().querySelector<HTMLButtonElement>(
        '[data-testid="date-option-2026-10-02"]',
      )!;
      expect(selected).toBeTruthy();
      expect(selected.classList.contains('selected')).toBe(true);
      expect(selected.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('FLOW_RESET', () => {
    it('[P1] should reset the flow to landing when the restaurant reloads (slug change)', async () => {
      await createLoadedComponent(RESTAURANT_OPEN_ALL_WEEK);

      bookButton().click();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[data-testid="party-size-step"]')).toBeTruthy();

      fixture.componentRef.setInput('slug', 'another-bistro');
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(bookButton()).toBeTruthy();
      expect(fixture.nativeElement.querySelector('[data-testid="party-size-step"]')).toBeFalsy();
      expect(fixture.componentInstance.flow.partySize()).toBeNull();
    });

    it('[P0] should reset the root-singleton flow when the page is destroyed mid-flow', async () => {
      await createLoadedComponent(RESTAURANT_OPEN_ALL_WEEK);

      bookButton().click();
      fixture.detectChanges();
      queryEl().querySelector<HTMLButtonElement>('[data-testid="party-size-option-4"]')!.click();
      fixture.detectChanges();
      queryEl()
        .querySelector<HTMLButtonElement>('[data-testid="date-option-2026-08-21"]')!
        .click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      queryEl()
        .querySelector<HTMLButtonElement>('[data-testid="time-option-10-00"]')!
        .click();
      fixture.detectChanges();

      const flow = fixture.componentInstance.flow;
      expect(flow.step()).toBe('details');
      expect(flow.partySize()).toBe(4);
      expect(flow.selectedDate()).toBe('2026-08-21');
      expect(flow.selectedSlot()).toBe('10:00');

      fixture.destroy();

      expect(flow.step()).toBe('landing');
      expect(flow.partySize()).toBeNull();
      expect(flow.selectedDate()).toBeNull();
      expect(flow.selectedSlot()).toBeNull();

      // Recreating on the same TestBed shares the root-singleton service —
      // the revisit must start at landing with no stale selections.
      bookingServiceSpy.getRestaurantBySlug.mockResolvedValue(RESTAURANT_OPEN_ALL_WEEK);
      fixture = TestBed.createComponent(BookingPageComponent);
      fixture.componentRef.setInput('slug', 'the-blue-bistro');
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(bookButton()).toBeTruthy();
      expect(fixture.componentInstance.flow.partySize()).toBeNull();
      expect(fixture.componentInstance.flow.selectedDate()).toBeNull();
      expect(fixture.componentInstance.flow.selectedSlot()).toBeNull();
    });
  });
});
