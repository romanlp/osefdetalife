import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BookingPageComponent } from './booking-page.component';
import { BookingService } from '../../services/booking.service';
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
};

/** Thursday 2026-08-20 at 23:30 UTC — already Friday Aug 21 in Europe/London. */
const FIXED_NOW = () => new Date('2026-08-20T23:30:00Z');

describe('BookingPageComponent', () => {
  let fixture: ComponentFixture<BookingPageComponent>;
  let bookingServiceSpy: { getRestaurantBySlug: ReturnType<typeof vi.fn> };

  function queryEl(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(async () => {
    bookingServiceSpy = { getRestaurantBySlug: vi.fn() };

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

    it('[P0] should auto-advance to the time-slot stub showing the selections after picking a date', async () => {
      await reachCalendar();

      queryEl()
        .querySelector<HTMLButtonElement>('[data-testid="date-option-2026-08-21"]')!
        .click();
      fixture.detectChanges();

      const stub = fixture.nativeElement.querySelector('[data-testid="time-slot-stub"]');
      expect(stub).toBeTruthy();
      expect(stub?.textContent).toContain('Party size: 4');
      expect(stub?.textContent).toContain('21 August 2026');
    });

    it('[P0] should expose the chosen ISO date on the summary time element', async () => {
      await reachCalendar();

      queryEl()
        .querySelector<HTMLButtonElement>('[data-testid="date-option-2026-08-21"]')!
        .click();
      fixture.detectChanges();

      const time = queryEl().querySelector<HTMLElement>('[data-testid="booking-summary"] time');
      expect(time?.getAttribute('datetime')).toBe('2026-08-21');
    });

    it('[P0] should announce "Step 4 of 6: Time" after picking a date', async () => {
      await reachCalendar();

      queryEl()
        .querySelector<HTMLButtonElement>('[data-testid="date-option-2026-08-21"]')!
        .click();
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

      const heading = queryEl().querySelector<HTMLHeadingElement>(
        '[data-testid="time-slot-stub"] h2',
      )!;
      expect(document.activeElement).toBe(heading);
    });

    it('[P1] should return to the calendar with the chosen date still highlighted when tapping back on the stub', async () => {
      await reachCalendar();

      queryEl()
        .querySelector<HTMLButtonElement>('[data-testid="date-option-2026-08-21"]')!
        .click();
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
  });
});
