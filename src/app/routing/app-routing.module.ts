import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ArticleListComponent} from '../gallery/article-list/article-list.component';

const routes: Routes = [
  {
    path: '',
    component: ArticleListComponent
  },
  {
    path: 'admin',
    loadChildren: 'app/admin/admin.module#AdminModule',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
