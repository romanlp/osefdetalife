import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleListComponent, ArticleListModule } from './article-list/article-list.component';
import { GalleryHomeComponent, GalleryHomeModule } from './gallery-home/gallery-home.component';
import { SharedModule } from '../shared/shared.module';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: ArticleListComponent,
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
