import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArticleListComponent } from './pages/article-list/article-list.component';
import { GalleryListComponent } from './pages/gallery-list/gallery-list.component';

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
    RouterModule.forChild(routes),
  ],
})
export class GalleryModule {
}
