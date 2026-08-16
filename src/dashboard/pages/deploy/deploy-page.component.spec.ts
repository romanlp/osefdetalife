import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DeployPageComponent } from './deploy-page.component';
import { AuthService } from '../../../app/services/auth.service';
import { OnboardingService } from '../../../app/services/onboarding.service';
import type { User } from 'firebase/auth';
import type { Restaurant } from '../../../shared/types/restaurant';

const RESTAURANT_FIXTURE: Restaurant = {
  id: 'test-id',
  name: 'Test Restaurant',
  slug: 'test-restaurant',
  ownerId: 'user-1',
  timezone: 'Europe/London',
  hours: {},
  tableGroups: [],
  whiteLabel: { primaryColor: '#1A1A1A', secondaryColor: '#8FA67A' },
  onboardingCompleted: true,
  createdAt: new Date('2026-01-01T00:00:00Z'),
};

class AuthServiceStub {
  user = signal<User | null>(null);
}

describe('DeployPageComponent', () => {
  let component: DeployPageComponent;
  let fixture: ComponentFixture<DeployPageComponent>;
  let authServiceStub: AuthServiceStub;
  let onboardingServiceSpy: {
    getRestaurantByOwner: ReturnType<typeof vi.fn>;
    getRestaurant: ReturnType<typeof vi.fn>;
    updateRestaurant: ReturnType<typeof vi.fn>;
    getCurrentUser: ReturnType<typeof vi.fn>;
  };
  let clipboardWriteSpy: ReturnType<typeof vi.fn>;
  let windowOpenSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    authServiceStub = new AuthServiceStub();
    authServiceStub.user.set({ uid: 'user-1' } as unknown as User);

    onboardingServiceSpy = {
      getRestaurantByOwner: vi.fn().mockResolvedValue(RESTAURANT_FIXTURE),
      getRestaurant: vi.fn().mockResolvedValue(RESTAURANT_FIXTURE),
      updateRestaurant: vi.fn().mockResolvedValue(undefined),
      getCurrentUser: vi.fn().mockReturnValue({ uid: 'user-1' }),
    };

    clipboardWriteSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: clipboardWriteSpy },
      configurable: true,
    });

    windowOpenSpy = vi.fn();
    vi.stubGlobal('open', windowOpenSpy);

    await TestBed.configureTestingModule({
      imports: [DeployPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceStub },
        { provide: OnboardingService, useValue: onboardingServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DeployPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  describe('Booking Link (AC: 1, 2)', () => {
    it('[P0] should load the restaurant for the current user', () => {
      expect(onboardingServiceSpy.getRestaurantByOwner).toHaveBeenCalledWith('user-1');
    });

    it('[P0] should compute the booking link with the restaurant slug', () => {
      expect(component.bookingLink()).toContain('/book/test-restaurant');
    });

    it('[P0] should compute a QR code URL from the booking link', () => {
      expect(component.qrCodeUrl()).toContain('api.qrserver.com');
      expect(component.qrCodeUrl()).toContain(encodeURIComponent(component.bookingLink()));
    });

    it('[P0] should expose a loading state that resolves after fetch', async () => {
      let resolveFn: (r: Restaurant | null) => void;
      onboardingServiceSpy.getRestaurantByOwner.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveFn = resolve;
          }),
      );

      const loadingFixture = TestBed.createComponent(DeployPageComponent);
      const loadingComponent = loadingFixture.componentInstance;
      loadingFixture.detectChanges();

      expect(loadingComponent.loading()).toBe(true);

      resolveFn!(RESTAURANT_FIXTURE);
      await loadingFixture.whenStable();
      loadingFixture.detectChanges();

      expect(loadingComponent.loading()).toBe(false);
    });

    it('[P1] should surface an error when the restaurant lookup fails', async () => {
      onboardingServiceSpy.getRestaurantByOwner.mockRejectedValueOnce(new Error('lookup failed'));

      const errorFixture = TestBed.createComponent(DeployPageComponent);
      errorFixture.detectChanges();
      await errorFixture.whenStable();
      errorFixture.detectChanges();

      expect(errorFixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    });
  });

  describe('Copy to Clipboard (AC: 3)', () => {
    it('[P0] should write the booking link to the clipboard', async () => {
      component.copy();
      await vi.waitFor(() => expect(clipboardWriteSpy).toHaveBeenCalled());
      expect(clipboardWriteSpy).toHaveBeenCalledWith(component.bookingLink());
    });

    it('[P0] should show the "Copied!" confirmation after a successful copy', async () => {
      component.copy();
      await vi.waitFor(() => expect(component.copied()).toBe(true));
      fixture.detectChanges();

      const message = fixture.nativeElement.querySelector('[data-testid="copied-message"]');
      expect(message?.getAttribute('role')).toBe('status');
      expect(message?.textContent).toContain('Copied!');
    });

    it('[P1] should auto-hide the "Copied!" confirmation after ~2 seconds', async () => {
      vi.useFakeTimers();
      try {
        component.copy();
        await Promise.resolve();
        await Promise.resolve();
        expect(component.copied()).toBe(true);

        vi.advanceTimersByTime(2000);
        expect(component.copied()).toBe(false);
      } finally {
        vi.useRealTimers();
      }
    });

    it('[P1] should show an error and NOT show "Copied!" when the clipboard write fails', async () => {
      clipboardWriteSpy.mockRejectedValueOnce(new Error('clipboard blocked'));

      component.copy();
      await Promise.resolve();
      await Promise.resolve();
      fixture.detectChanges();

      expect(component.copied()).toBe(false);
      expect(fixture.nativeElement.textContent).not.toContain('Copied!');
      expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    });
  });

  describe('QR Code (AC: 4)', () => {
    it('[P0] should render a QR code image with the correct src', () => {
      const qrImg = fixture.nativeElement.querySelector('img');
      expect(qrImg).toBeTruthy();
      expect(qrImg?.getAttribute('src')).toContain('api.qrserver.com');
      expect(qrImg?.getAttribute('alt')).toBe('QR code for your booking link');
    });
  });

  describe('Preview Button (AC: 5)', () => {
    it('[P0] should render a preview button', () => {
      const previewBtn = fixture.nativeElement.querySelector('[data-testid="preview-button"]');
      expect(previewBtn).toBeTruthy();
      expect(previewBtn?.textContent).toContain('Preview booking page');
    });

    it('[P0] should open the booking link in a new tab when preview is clicked', () => {
      component.openPreview();
      expect(windowOpenSpy).toHaveBeenCalledWith(
        component.bookingLink(),
        '_blank',
        'noopener,noreferrer',
      );
    });
  });
});