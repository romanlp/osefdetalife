import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DashboardShellComponent } from './dashboard-shell.component';

describe('DashboardShellComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardShellComponent],
      providers: [provideRouter([])],
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
});
