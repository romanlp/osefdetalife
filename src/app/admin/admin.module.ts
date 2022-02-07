import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { AdminGalleriesComponent } from './admin-galleries/admin-galleries.component';
import { AdminHeaderModule } from './admin-header/admin-header.component';
import { AdminComponent } from './admin.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        component: HomeComponent
      },
      {
        path: 'galleries',
        component: AdminGalleriesComponent
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    AdminHeaderModule,
  ],
  declarations: [
    AdminComponent,
    HomeComponent
  ]
})
export class AdminModule {
}
