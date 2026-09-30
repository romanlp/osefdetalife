import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DashboardShellComponent } from './dashboard-shell.component';
import { AuthService } from '../../app/services/auth.service';

describe('DashboardShellComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardShellComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { user: signal(null), signOut: vi.fn() } },
      ],
    }).compileComponents();
  });

  it('[P0] should render the dashboard sidebar', () => {
    const fixture = TestBed.createComponent(DashboardShellComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('osef-dashboard-sidebar')).toBeTruthy();
  });

  it('[P0] should render a router outlet for child routes', () => {
    const fixture = TestBed.createComponent(DashboardShellComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
  });

  it('[P1] should render the main area on the linen canvas, filling the remaining width', () => {
    const fixture = TestBed.createComponent(DashboardShellComponent);
    fixture.detectChanges();
    const main: HTMLElement = fixture.nativeElement.querySelector('main');
    expect(main.classList).toContain('bg-linen');
    expect(main.classList).toContain('flex-1');
    expect(main.classList).toContain('min-w-0');
  });
});
