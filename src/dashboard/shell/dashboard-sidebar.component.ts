import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../app/services/auth.service';

export interface NavItem {
  label: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'osef-dashboard-sidebar',
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './dashboard-sidebar.component.html',
  styleUrl: './dashboard-sidebar.component.scss',
  host: {
    class: 'block h-full w-16 shrink-0 border-r border-hairline bg-surface text-ink md:w-60',
  },
})
export class DashboardSidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private injector = inject(Injector);
  private signOutButton = viewChild.required<ElementRef<HTMLButtonElement>>('signOutButton');

  readonly navItems: readonly NavItem[] = [
    { label: 'Bookings', icon: 'calendar_today', path: '/dashboard' },
    { label: 'Info', icon: 'info', path: '/dashboard' },
    { label: 'Hours', icon: 'schedule', path: '/dashboard' },
    { label: 'Tables', icon: 'table_bar', path: '/dashboard' },
    { label: 'Branding', icon: 'palette', path: '/dashboard' },
    { label: 'Booking Link', icon: 'link', path: '/dashboard/booking-link' },
    { label: 'Account', icon: 'account_circle', path: '/dashboard' },
  ];

  readonly signingOut = signal(false);
  readonly signOutError = signal<string | null>(null);

  async signOut(): Promise<void> {
    if (this.signingOut()) return;

    this.signingOut.set(true);
    this.signOutError.set(null);
    let signedOut = false;
    try {
      await this.authService.signOut();
      signedOut = true;
      await this.router.navigate(['/login']);
    } catch {
      if (!signedOut) {
        this.signOutError.set('Unable to sign out. Please try again.');
        afterNextRender(() => this.signOutButton().nativeElement.focus(), {
          injector: this.injector,
        });
      }
    } finally {
      this.signingOut.set(false);
    }
  }
}
