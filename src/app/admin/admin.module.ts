import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { AdminGalleriesComponent } from './admin-galleries/admin-galleries.component';
import { AdminHeaderModule } from './admin-header/admin-header.component';
import { AdminComponent } from './admin.component';
import { HomeComponent } from './home/home.component';
import { AdminGalleryComponent } from './admin-gallery/admin-gallery.component';
import {MatGridListModule} from "@angular/material/grid-list";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {MatLegacyCardModule as MatCardModule} from "@angular/material/legacy-card";

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
        component: AdminGalleriesComponent,
        children: [
          {
            path: ':id',
            component: AdminGalleryComponent
          },
        ]
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
    MatGridListModule,
    DragDropModule,
    MatCardModule,
  ],
  declarations: [
    AdminComponent,
    HomeComponent,
    AdminGalleryComponent
  ]
})
export class AdminModule {
}
