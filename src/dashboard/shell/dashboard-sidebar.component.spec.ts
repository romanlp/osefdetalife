import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { DashboardSidebarComponent } from './dashboard-sidebar.component';

const EXPECTED_LABELS = [
  'Bookings',
  'Info',
  'Hours',
  'Tables',
  'Branding',
  'Deploy',
  'Account',
];

const EXPECTED_TEST_IDS = [
  'nav-item-bookings',
  'nav-item-info',
  'nav-item-hours',
  'nav-item-tables',
  'nav-item-branding',
  'nav-item-deploy',
  'nav-item-account',
];

describe('DashboardSidebarComponent', () => {
  let component: DashboardSidebarComponent;
  let fixture: ComponentFixture<DashboardSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardSidebarComponent],
      providers: [
        provideRouter([
          {
            path: 'dashboard',
            loadChildren: () =>
              import('../dashboard.routes').then((m) => m.dashboardRoutes),
          },
        ]),
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

    it('[P0] should route the Deploy item to /dashboard/deploy', () => {
      const deploy = component.navItems.find((item) => item.label === 'Deploy');
      expect(deploy?.path).toBe('/dashboard/deploy');
    });

    it('[P0] should render one nav anchor per item', () => {
      const nav = fixture.nativeElement.querySelector('[data-testid="sidebar-nav"]');
      const anchors = nav?.querySelectorAll('a');
      expect(anchors?.length).toBe(7);
    });

    it('[P0] should render the seven nav item anchors with expected test ids', () => {
      for (const testId of EXPECTED_TEST_IDS) {
        expect(fixture.nativeElement.querySelector(`[data-testid="${testId}"]`)).toBeTruthy();
      }
    });

    it('[P1] should navigate to /dashboard/deploy when the Deploy item is clicked', async () => {
      const router = TestBed.inject(Router);
      await router.navigateByUrl('/dashboard');
      await fixture.whenStable();
      fixture.detectChanges();

      fixture.nativeElement.querySelector('[data-testid="nav-item-deploy"]')?.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(router.url).toBe('/dashboard/deploy');
    });

    it('[P1] should navigate to the home placeholder when a non-Deploy item is clicked', async () => {
      const router = TestBed.inject(Router);
      await router.navigateByUrl('/dashboard/deploy');
      await fixture.whenStable();
      fixture.detectChanges();

      fixture.nativeElement.querySelector('[data-testid="nav-item-bookings"]')?.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(router.url).toBe('/dashboard');
    });
  });

  describe('Active State (AC: 5)', () => {
    it('[P1] should not mark Deploy active on the /dashboard route', async () => {
      const router = TestBed.inject(Router);
      await router.navigateByUrl('/dashboard');
      await fixture.whenStable();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('[data-testid="nav-item-deploy"]')?.classList.contains('active')).toBe(false);
      expect(fixture.nativeElement.querySelector('[data-testid="nav-item-bookings"]')?.classList.contains('active')).toBe(true);
    });

    it('[P1] should mark only Deploy active on the /dashboard/deploy route', async () => {
      const router = TestBed.inject(Router);
      await router.navigateByUrl('/dashboard/deploy');
      await fixture.whenStable();
      fixture.detectChanges();

      const active = fixture.nativeElement.querySelectorAll('a.active');
      expect(active.length).toBe(1);
      expect(active[0]?.getAttribute('data-testid')).toBe('nav-item-deploy');
    });
  });
});
