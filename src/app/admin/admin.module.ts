import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGalleriesComponent } from './admin-galleries/admin-galleries.component';
import { AdminGalleryComponent } from './admin-gallery/admin-gallery.component';
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
    RouterModule.forChild(routes),
  ]
})
export class AdminModule {
}
