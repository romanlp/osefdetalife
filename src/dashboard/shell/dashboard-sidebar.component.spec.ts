import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { signal, type WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { DashboardSidebarComponent } from './dashboard-sidebar.component';
import { AuthService } from '../../app/services/auth.service';
import { OnboardingService } from '../../app/services/onboarding.service';

const EXPECTED_LABELS = [
  'Bookings',
  'Info',
  'Hours',
  'Tables',
  'Branding',
  'Booking Link',
  'Account',
];

const EXPECTED_TEST_IDS = [
  'nav-item-bookings',
  'nav-item-info',
  'nav-item-hours',
  'nav-item-tables',
  'nav-item-branding',
  'nav-item-booking-link',
  'nav-item-account',
];

describe('DashboardSidebarComponent', () => {
  let component: DashboardSidebarComponent;
  let fixture: ComponentFixture<DashboardSidebarComponent>;
  let authServiceStub: { user: WritableSignal<null>; signOut: Mock<() => Promise<void>> };

  const query = (selector: string): HTMLElement | null =>
    fixture.nativeElement.querySelector(selector);

  const signOutButton = (): HTMLButtonElement =>
    query('[data-testid="sign-out-button"]') as HTMLButtonElement;

  beforeEach(async () => {
    authServiceStub = {
      user: signal(null),
      signOut: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardSidebarComponent],
      providers: [
        provideRouter([
          {
            path: 'dashboard',
            loadChildren: () =>
              import('../dashboard.routes').then((m) => m.dashboardRoutes),
          },
          { path: 'login', children: [] },
        ]),
        { provide: AuthService, useValue: authServiceStub },
        { provide: OnboardingService, useValue: { getRestaurantByOwner: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Navigation Items (AC: 5)', () => {
    it('[P0] should define exactly 7 nav items in the required order', () => {
      expect(component.navItems.map((item) => item.label)).toEqual(EXPECTED_LABELS);
    });

    it('[P0] should route the Booking Link item to /dashboard/booking-link', () => {
      const bookingLink = component.navItems.find((item) => item.label === 'Booking Link');
      expect(bookingLink?.path).toBe('/dashboard/booking-link');
      expect(bookingLink?.icon).toBe('link');
    });

    it('[P0] should render one nav anchor per item', () => {
      const anchors = query('[data-testid="sidebar-nav"]')?.querySelectorAll('a');
      expect(anchors?.length).toBe(7);
    });

    it('[P0] should render the seven nav item anchors with expected test ids', () => {
      for (const testId of EXPECTED_TEST_IDS) {
        expect(query(`[data-testid="${testId}"]`)).toBeTruthy();
      }
    });

    it('[P1] should navigate to /dashboard/booking-link when the Booking Link item is clicked', async () => {
      const router = TestBed.inject(Router);
      await router.navigateByUrl('/dashboard');
      await fixture.whenStable();
      fixture.detectChanges();

      query('[data-testid="nav-item-booking-link"]')?.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(router.url).toBe('/dashboard/booking-link');
    });

    it('[P1] should navigate to the home placeholder when a non-Booking-Link item is clicked', async () => {
      const router = TestBed.inject(Router);
      await router.navigateByUrl('/dashboard/booking-link');
      await fixture.whenStable();
      fixture.detectChanges();

      query('[data-testid="nav-item-bookings"]')?.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(router.url).toBe('/dashboard');
    });
  });

  describe('Active State (AC: 5)', () => {
    it('[P1] should not mark Booking Link active on the /dashboard route', async () => {
      const router = TestBed.inject(Router);
      await router.navigateByUrl('/dashboard');
      await fixture.whenStable();
      fixture.detectChanges();

      expect(query('[data-testid="nav-item-booking-link"]')?.classList.contains('active')).toBe(false);
      expect(query('[data-testid="nav-item-bookings"]')?.classList.contains('active')).toBe(true);
    });

    it('[P1] should mark only Booking Link active on the /dashboard/booking-link route', async () => {
      const router = TestBed.inject(Router);
      await router.navigateByUrl('/dashboard/booking-link');
      await fixture.whenStable();
      fixture.detectChanges();

      const active = fixture.nativeElement.querySelectorAll('a.active');
      expect(active.length).toBe(1);
      expect(active[0]?.getAttribute('data-testid')).toBe('nav-item-booking-link');
      expect(active[0]?.getAttribute('aria-current')).toBe('page');
    });

    it('[P0] should redirect /dashboard/deploy to /dashboard/booking-link and mark Booking Link active (OLD_LINK)', async () => {
      const router = TestBed.inject(Router);
      await router.navigateByUrl('/dashboard/deploy');
      await fixture.whenStable();
      fixture.detectChanges();

      expect(router.url).toBe('/dashboard/booking-link');
      const active = fixture.nativeElement.querySelectorAll('a.active');
      expect(active.length).toBe(1);
      expect(active[0]?.getAttribute('data-testid')).toBe('nav-item-booking-link');
    });
  });

  describe('Responsive rail (WIDE / NARROW)', () => {
    it('[P0] should be 64px wide below md and 240px from md up', () => {
      const host = fixture.nativeElement as HTMLElement;
      expect(host.classList).toContain('w-16');
      expect(host.classList).toContain('md:w-60');
    });

    it('[P0] should hide every label below md and show it from md up', () => {
      const labels = fixture.nativeElement.querySelectorAll('a span, [data-testid="sign-out-button"] span');
      expect(labels.length).toBe(8);
      for (const label of labels) {
        expect(label.classList).toContain('hidden');
        expect(label.classList).toContain('md:inline');
      }
    });

    it('[P0] should give every nav item an accessible name and a tooltip at both widths', () => {
      EXPECTED_TEST_IDS.forEach((testId, index) => {
        const link = query(`[data-testid="${testId}"]`);
        expect(link?.getAttribute('aria-label')).toBe(EXPECTED_LABELS[index]);
        expect(link?.getAttribute('title')).toBe(EXPECTED_LABELS[index]);
      });
    });

    it('[P1] should keep icons visible and hidden from assistive tech', () => {
      const icons = fixture.nativeElement.querySelectorAll('a mat-icon');
      expect(icons.length).toBe(7);
      for (const icon of icons) {
        expect(icon.getAttribute('aria-hidden')).toBe('true');
        expect(icon.classList).not.toContain('hidden');
      }
    });
  });

  describe('Sign out (SIGN_OUT / SIGN_OUT_FAIL)', () => {
    it('[P0] should render a named sign-out button at the sidebar foot', () => {
      const button = signOutButton();
      expect(button.tagName).toBe('BUTTON');
      expect(button.getAttribute('type')).toBe('button');
      expect(button.getAttribute('aria-label')).toBe('Sign out');
      expect(button.getAttribute('title')).toBe('Sign out');
      expect(query('ul')?.compareDocumentPosition(button)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it('[P0] should sign out then navigate to /login', async () => {
      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      signOutButton().click();
      await fixture.whenStable();

      expect(authServiceStub.signOut).toHaveBeenCalledTimes(1);
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
      expect(authServiceStub.signOut.mock.invocationCallOrder[0]).toBeLessThan(
        navigateSpy.mock.invocationCallOrder[0],
      );
    });

    it('[P0] should disable the button while sign out is in flight', async () => {
      let resolveSignOut!: () => void;
      authServiceStub.signOut.mockReturnValue(new Promise<void>((resolve) => (resolveSignOut = resolve)));
      vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

      signOutButton().click();
      fixture.detectChanges();

      expect(signOutButton().disabled).toBe(true);
      expect(signOutButton().getAttribute('aria-busy')).toBe('true');

      signOutButton().click();
      expect(authServiceStub.signOut).toHaveBeenCalledTimes(1);

      resolveSignOut();
      await new Promise((resolve) => setTimeout(resolve));
      await fixture.whenStable();
      fixture.detectChanges();

      expect(signOutButton().disabled).toBe(false);
    });

    it('[P0] should re-enable the button, announce an alert and not navigate when sign out fails', async () => {
      authServiceStub.signOut.mockRejectedValue(new Error('network'));
      const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

      signOutButton().click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(navigateSpy).not.toHaveBeenCalled();
      expect(signOutButton().disabled).toBe(false);
      expect(query('[role="alert"]')?.textContent).toContain('Unable to sign out');
    });

    it('[P0] should return focus to the sign-out button after a failed sign out', async () => {
      authServiceStub.signOut.mockRejectedValue(new Error('network'));
      vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

      signOutButton().focus();
      signOutButton().click();
      fixture.detectChanges();
      expect(signOutButton().disabled).toBe(true);

      await fixture.whenStable();
      fixture.detectChanges();

      expect(signOutButton().disabled).toBe(false);
      expect(document.activeElement).toBe(signOutButton());
    });

    it('[P0] should re-enable the button when navigation to /login rejects', async () => {
      vi.spyOn(TestBed.inject(Router), 'navigate').mockRejectedValue(new Error('nav'));

      await component.signOut();
      fixture.detectChanges();

      expect(component.signingOut()).toBe(false);
      expect(signOutButton().disabled).toBe(false);
      expect(query('[role="alert"]')).toBeNull();
    });

    it('[P1] should show the alert beside the rail on narrow viewports', async () => {
      authServiceStub.signOut.mockRejectedValue(new Error('network'));

      signOutButton().click();
      await fixture.whenStable();
      fixture.detectChanges();

      const alert = query('[role="alert"]');
      expect(alert?.classList).not.toContain('max-md:sr-only');
      expect(alert?.classList).toContain('max-md:absolute');
      expect(alert?.classList).toContain('max-md:left-full');
    });

    it('[P1] should clear the alert when the owner retries', async () => {
      authServiceStub.signOut.mockRejectedValueOnce(new Error('network'));
      vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

      signOutButton().click();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(query('[role="alert"]')).toBeTruthy();

      signOutButton().click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(query('[role="alert"]')).toBeNull();
      expect(authServiceStub.signOut).toHaveBeenCalledTimes(2);
    });
  });
});
