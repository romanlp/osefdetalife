import { Routes } from '@angular/router';
import { AuthenticatedGuard } from './guard/authenticated.guard';

export const routes: Routes = [
  {
    path: 'galleries',
    loadChildren: () => import('../gallery/gallery.module').then(m => m.GalleryModule),
  },
  {
    path: 'login',
    loadComponent: () => import('../login/login-page/login-page.component').then(m => m.LoginPageComponent),
    canLoad: [AuthenticatedGuard],
  },
  {
    path: 'admin',
    loadChildren: () => import('../admin/admin.module').then(m => m.AdminModule),
    canLoad: [AuthenticatedGuard],
  },
  {
    path: '',
    redirectTo: 'galleries',
    pathMatch: 'full'
  },
];
