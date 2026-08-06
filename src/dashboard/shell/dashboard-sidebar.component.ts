import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
})
export class DashboardSidebarComponent {
  navItems: NavItem[] = [
    { label: 'Bookings', icon: 'calendar_today', path: '/dashboard' },
    { label: 'Info', icon: 'info', path: '/dashboard' },
    { label: 'Hours', icon: 'schedule', path: '/dashboard' },
    { label: 'Tables', icon: 'table_bar', path: '/dashboard' },
    { label: 'Branding', icon: 'palette', path: '/dashboard' },
    { label: 'Deploy', icon: 'code', path: '/dashboard/deploy' },
    { label: 'Account', icon: 'account_circle', path: '/dashboard' },
  ];
}
