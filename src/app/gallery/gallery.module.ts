import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ArticleListComponent} from './article-list/article-list.component';
import {GalleryHomeComponent} from './gallery-home/gallery-home.component';
import {GalleryHeaderComponent} from './gallery-header/gallery-header.component';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [ArticleListComponent, GalleryHomeComponent, GalleryHeaderComponent]
})
export class GalleryModule {
}
