import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardSidebarComponent } from './dashboard-sidebar.component';

@Component({
  selector: 'osef-dashboard-shell',
  imports: [RouterOutlet, DashboardSidebarComponent],
  templateUrl: './dashboard-shell.component.html',
  styleUrl: './dashboard-shell.component.scss',
})
export class DashboardShellComponent {}
