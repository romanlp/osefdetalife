import { describe, it, expect, vi } from 'vitest';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreakpointObserver, type BreakpointState } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { DashboardShellComponent } from './dashboard-shell.component';
import { DashboardSidebarComponent } from './dashboard-sidebar.component';
import { AuthService } from '../../app/services/auth.service';

describe('DashboardShellComponent', () => {
  let fixture: ComponentFixture<DashboardShellComponent>;
  let breakpoint$: BehaviorSubject<BreakpointState>;

  const query = (selector: string): HTMLElement | null =>
    fixture.nativeElement.querySelector(selector);
  const sidenav = (): MatSidenav => fixture.debugElement.query(By.directive(MatSidenav)).componentInstance;
  const menuButton = (): HTMLButtonElement | null => query('[data-testid="menu-button"]') as HTMLButtonElement | null;

  async function setup(wide: boolean): Promise<void> {
    breakpoint$ = new BehaviorSubject<BreakpointState>({ matches: wide, breakpoints: {} });
    await TestBed.configureTestingModule({
      imports: [DashboardShellComponent],
      providers: [
        provideRouter([]),
        { provide: BreakpointObserver, useValue: { observe: () => breakpoint$ } },
        { provide: AuthService, useValue: { user: signal(null), signOut: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardShellComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const setWide = async (wide: boolean): Promise<void> => {
    breakpoint$.next({ matches: wide, breakpoints: {} });
    fixture.detectChanges();
    await fixture.whenStable();
  };

  it('[P0] should render the sidebar inside a sidenav and a router outlet inside the content', async () => {
    await setup(true);
    expect(query('mat-sidenav-container mat-sidenav osef-dashboard-sidebar')).toBeTruthy();
    expect(query('mat-sidenav-container mat-sidenav-content main router-outlet')).toBeTruthy();
  });

  describe('WIDE', () => {
    it('[P0] should use side mode, stay open and render no toolbar', async () => {
      await setup(true);
      expect(sidenav().mode).toBe('side');
      expect(sidenav().opened).toBe(true);
      expect(query('mat-toolbar')).toBeNull();
      expect(menuButton()).toBeNull();
    });

    it('[P0] should stay open when Escape is pressed', async () => {
      await setup(true);

      const escape = new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true });
      query('mat-sidenav')?.dispatchEvent(escape);
      await new Promise((resolve) => setTimeout(resolve));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(sidenav().opened).toBe(true);
    });

    it('[P1] should keep the drawer open when an item is selected', async () => {
      await setup(true);
      fixture.debugElement.query(By.directive(DashboardSidebarComponent)).componentInstance.itemSelected.emit();
      fixture.detectChanges();
      expect(sidenav().opened).toBe(true);
    });
  });

  describe('NARROW', () => {
    it('[P0] should use over mode, start closed and show a named menu button', async () => {
      await setup(false);
      expect(sidenav().mode).toBe('over');
      expect(sidenav().opened).toBe(false);
      expect(query('mat-toolbar')).toBeTruthy();
      expect(menuButton()?.getAttribute('aria-label')).toBe('Open navigation');
      expect(menuButton()?.getAttribute('aria-expanded')).toBe('false');
      expect(menuButton()?.getAttribute('aria-controls')).toBe('dashboard-sidenav');
    });
  });

  describe('OPEN_CLOSE', () => {
    it('[P0] should open the drawer from the menu button', async () => {
      await setup(false);
      menuButton()?.click();
      fixture.detectChanges();
      expect(sidenav().opened).toBe(true);
      expect(menuButton()?.getAttribute('aria-expanded')).toBe('true');
    });

    it('[P0] should close the drawer when an item is selected', async () => {
      await setup(false);
      menuButton()?.click();
      fixture.detectChanges();

      fixture.debugElement.query(By.directive(DashboardSidebarComponent)).componentInstance.itemSelected.emit();
      fixture.detectChanges();

      expect(sidenav().opened).toBe(false);
      expect(menuButton()?.getAttribute('aria-expanded')).toBe('false');
    });

    it('[P0] should sync state when the drawer closes itself (Esc / scrim)', async () => {
      await setup(false);
      menuButton()?.click();
      fixture.detectChanges();
      await fixture.whenStable();

      const escape = new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true });
      query('mat-sidenav')?.dispatchEvent(escape);
      await new Promise((resolve) => setTimeout(resolve));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(sidenav().opened).toBe(false);
      expect(fixture.componentInstance.menuOpen()).toBe(false);
      expect(menuButton()?.getAttribute('aria-expanded')).toBe('false');
    });

    it('[P0] should return focus to the menu button when the drawer closes', async () => {
      await setup(false);
      menuButton()?.focus();
      menuButton()?.click();
      fixture.detectChanges();
      await new Promise((resolve) => setTimeout(resolve));
      fixture.detectChanges();
      await fixture.whenStable();

      query('[data-testid="nav-item-info"]')?.focus();
      expect(document.activeElement).toBe(query('[data-testid="nav-item-info"]'));

      fixture.debugElement.query(By.directive(DashboardSidebarComponent)).componentInstance.itemSelected.emit();
      fixture.detectChanges();

      expect(document.activeElement).toBe(menuButton());
    });
  });

  describe('RESIZE', () => {
    it('[P0] should switch to an open side drawer and drop the toolbar when widened with the drawer open', async () => {
      await setup(false);
      menuButton()?.click();
      fixture.detectChanges();

      await setWide(true);

      expect(sidenav().mode).toBe('side');
      expect(sidenav().opened).toBe(true);
      expect(query('mat-toolbar')).toBeNull();
    });

    it('[P1] should come back closed when narrowed again', async () => {
      await setup(false);
      menuButton()?.click();
      fixture.detectChanges();
      await setWide(true);

      await setWide(false);

      expect(sidenav().mode).toBe('over');
      expect(sidenav().opened).toBe(false);
      expect(menuButton()?.getAttribute('aria-expanded')).toBe('false');
    });
  });
});
