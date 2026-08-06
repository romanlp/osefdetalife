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

const WIDGET_BUNDLE_URL = 'http://localhost:4200/widget/booking-widget.mjs';

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

  describe('Embed Code (AC: 1, 2)', () => {
    it('[P0] should load the restaurant for the current user', () => {
      expect(onboardingServiceSpy.getRestaurantByOwner).toHaveBeenCalledWith('user-1');
    });

    it('[P0] should render the restaurant slug inside the embed code block', () => {
      const embed = fixture.nativeElement.querySelector('[data-testid="embed-code"]');
      expect(embed?.textContent).toContain('test-restaurant');
    });

    it('[P0] should include a <script> tag pointing to the widget bundle', () => {
      expect(component.embedSnippet()).toContain('<script');
      expect(component.embedSnippet()).toContain(WIDGET_BUNDLE_URL);
      expect(component.embedSnippet()).toContain('booking-widget.mjs');
      expect(component.embedSnippet()).toContain('type="module"');
    });

    it('[P0] should include a <booking-widget restaurant="{slug}"> element', () => {
      expect(component.embedSnippet()).toContain('<booking-widget restaurant="test-restaurant"></booking-widget>');
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
    it('[P0] should write the full snippet to the clipboard', async () => {
      component.copy();
      await vi.waitFor(() => expect(clipboardWriteSpy).toHaveBeenCalled());
      expect(clipboardWriteSpy).toHaveBeenCalledWith(component.embedSnippet());
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

  describe('Demo Link (AC: 4)', () => {
    it('[P0] should expose a demo URL carrying the restaurant slug', () => {
      expect(component.demoUrl()).toContain('/assets/demo.html?slug=test-restaurant');
    });

    it('[P0] should render a demo link that opens in a new tab', () => {
      const link = fixture.nativeElement.querySelector('[data-testid="demo-link"]');
      expect(link?.getAttribute('href')).toContain('/assets/demo.html?slug=test-restaurant');
      expect(link?.getAttribute('target')).toBe('_blank');
      expect(link?.getAttribute('rel')).toBe('noopener');
    });
  });
});
