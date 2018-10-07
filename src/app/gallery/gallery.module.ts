import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ArticleListComponent} from './article-list/article-list.component';
import {GalleryHomeComponent} from './gallery-home/gallery-home.component';
import {GalleryHeaderComponent} from './gallery-header/gallery-header.component';
import {SharedModule} from '../shared/shared.module';
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
    RouterModule.forChild(routes),
  ],
  declarations: [ArticleListComponent, GalleryHomeComponent, GalleryHeaderComponent]
})
export class GalleryModule {
}
