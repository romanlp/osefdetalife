import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import {ArticleListComponent} from './pages/article-list/article-list.component';
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
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
  ],
})
export class GalleryModule {
}
