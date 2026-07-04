import { Routes } from '@angular/router';
import { AuthGuard } from './guard/authenticated.guard';

export const routes: Routes = [
  {
    path: 'galleries',
    loadChildren: () =>
      import('../gallery/gallery.module').then((m) => m.GalleryModule),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('../login/login-page/login-page.component').then(
        (m) => m.LoginPageComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('../admin/admin.module').then((m) => m.AdminModule),
    canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: 'galleries',
    pathMatch: 'full',
  },
];
