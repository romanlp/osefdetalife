import { Routes } from '@angular/router';
import {
  isAuthenticatedGuard,
  isNotAuthenticatedGuard,
} from './routing/guard/authenticated.guard';

export const routes: Routes = [
  {
    path: 'galleries',
    loadChildren: () =>
      import('./gallery/gallery.module').then((m) => m.GalleryModule),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login-page/login-page.component').then(
        (m) => m.LoginPageComponent,
      ),
    canActivate: [isNotAuthenticatedGuard],
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.module').then((m) => m.AdminModule),
    canActivate: [isAuthenticatedGuard],
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('../dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
