import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthenticatedGuard } from './guard/authenticated.guard';
import { HomeComponent } from '../home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'gallery',
    loadChildren: 'app/gallery/gallery.module#GalleryModule',
  },
  {
    path: 'login',
    loadChildren: 'app/login/login.module#LoginModule',
    canLoad: [AuthenticatedGuard],
  },
  {
    path: 'admin',
    loadChildren: 'app/admin/admin.module#AdminModule',
    canLoad: [AuthenticatedGuard],
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthenticatedGuard]
})
export class AppRoutingModule { }
