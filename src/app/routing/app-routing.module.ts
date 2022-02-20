import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../home/home.component';
import { AuthenticatedGuard } from './guard/authenticated.guard';

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'galleries',
    loadChildren: () => import('../gallery/gallery.module').then(m => m.GalleryModule),
  },
  {
    path: 'login',
    loadChildren: () => import('../login/login-page/login-page.component').then(m => m.LoginPageModule),
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

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
  providers: [AuthenticatedGuard]
})
export class AppRoutingModule {
}
