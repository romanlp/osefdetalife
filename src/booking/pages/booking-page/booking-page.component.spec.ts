import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BookingPageComponent } from './booking-page.component';
import { BookingService } from '../../services/booking.service';
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

describe('BookingPageComponent', () => {
  let fixture: ComponentFixture<BookingPageComponent>;
  let bookingServiceSpy: { getRestaurantBySlug: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    bookingServiceSpy = { getRestaurantBySlug: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [BookingPageComponent],
      providers: [
        provideRouter([]),
        { provide: BookingService, useValue: bookingServiceSpy },
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
      expect(fixture.nativeElement.querySelector('[data-testid="book-button"]')?.textContent).toContain('Book a Table');
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
      expect(fixture.nativeElement.querySelector('[data-testid="book-button"]')).toBeTruthy();
    });
  });

  describe('INVALID_SLUG', () => {
    it('[P0] should show "Restaurant not found" when the slug doc does not exist', async () => {
      bookingServiceSpy.getRestaurantBySlug.mockResolvedValue(null);
      await createComponent('definitely-not-a-real-slug');

      expect(fixture.nativeElement.textContent).toContain('Restaurant not found');
      expect(fixture.nativeElement.querySelector('[data-testid="book-button"]')).toBeFalsy();
      expect(fixture.nativeElement.querySelector('[data-testid="retry-button"]')).toBeFalsy();
    });
  });

  describe('RESTAURANT_MISSING', () => {
    it('[P0] should show "Restaurant not found" when the slug exists but the restaurant doc is missing', async () => {
      bookingServiceSpy.getRestaurantBySlug.mockResolvedValue(null);
      await createComponent('stale-slug');

      expect(fixture.nativeElement.textContent).toContain('Restaurant not found');
      expect(fixture.nativeElement.querySelector('[data-testid="book-button"]')).toBeFalsy();
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
});
