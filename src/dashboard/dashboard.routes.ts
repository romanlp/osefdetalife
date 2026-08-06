import { Routes } from '@angular/router';
import { DashboardShellComponent } from './shell/dashboard-shell.component';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardShellComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/home/home-page.component').then(
            (m) => m.HomePageComponent,
          ),
      },
      {
        path: 'deploy',
        loadComponent: () =>
          import('./pages/deploy/deploy-page.component').then(
            (m) => m.DeployPageComponent,
          ),
      },
    ],
  },
];
