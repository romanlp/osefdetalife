import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import {ArticleListComponent, ArticleListModule} from './article-list/article-list.component';
import {GalleryHomeComponent, GalleryHomeModule} from './pages/gallery-home/gallery-home.component';
import {GalleryListComponent} from './pages/gallery-list/gallery-list.component';

const routes: Routes = [
  {
    path: '',
    component: GalleryListComponent
  },
  {
    path: ':id',
    component: ArticleListComponent
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
  declarations: [
    GalleryListComponent
  ],
})
export class GalleryModule {
}
