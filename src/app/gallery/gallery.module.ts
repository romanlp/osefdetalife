import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ArticleListComponent, ArticleListModule } from './article-list/article-list.component';
import { GalleryHomeComponent, GalleryHomeModule } from './gallery-home/gallery-home.component';

const routes: Routes = [
  {
    path: ':id',
    component: ArticleListComponent
  },
  {
    path: '',
    redirectTo: 'london',
  },
  {
    path: 'home',
    component: GalleryHomeComponent
  }
];
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ArticleListModule,
    GalleryHomeModule,
    RouterModule.forChild(routes),
  ],
})
export class GalleryModule {
}
