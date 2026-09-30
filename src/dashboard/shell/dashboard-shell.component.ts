import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, inject, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { DashboardSidebarComponent } from './dashboard-sidebar.component';

export const WIDE_QUERY = '(min-width: 768px)';

@Component({
  selector: 'osef-dashboard-shell',
  imports: [
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatToolbarModule,
    DashboardSidebarComponent,
  ],
  templateUrl: './dashboard-shell.component.html',
  styleUrl: './dashboard-shell.component.scss',
  host: { class: 'block' },
})
export class DashboardShellComponent {
  readonly isWide = toSignal(
    inject(BreakpointObserver)
      .observe(WIDE_QUERY)
      .pipe(map((state) => state.matches)),
    { requireSync: true },
  );

  readonly menuOpen = linkedSignal({ source: this.isWide, computation: () => false });
  readonly mode = computed(() => (this.isWide() ? 'side' : 'over'));
  readonly opened = computed(() => this.isWide() || this.menuOpen());

  onOpenedChange(open: boolean): void {
    if (!this.isWide()) this.menuOpen.set(open);
  }

  closeIfOver(): void {
    if (!this.isWide()) this.menuOpen.set(false);
  }
}
