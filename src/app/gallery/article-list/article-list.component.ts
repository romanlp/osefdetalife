import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, NgModule} from '@angular/core';
import {collection, CollectionReference, doc, docData, Firestore} from '@angular/fire/firestore';
import {Storage} from '@angular/fire/storage';
import {MatLegacyDialog as MatDialog} from '@angular/material/legacy-dialog';
import {DialogImageComponent} from '../../shared/dialog-image/dialog-image.component';
import {map, switchMap} from "rxjs/operators";
import {ActivatedRoute} from "@angular/router";
import {GalleryData} from 'src/app/shared/gallery/GalleryData';

@Component({
  selector: 'osef-article-list',
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticleListComponent {

  collection = collection(this.firestore, 'galleries') as CollectionReference<GalleryData>;

  document$ = this.activatedRoute.params.pipe(
    map((params) => params['id']),
    switchMap((id) => docData<GalleryData>(doc(this.collection, id), {idField: 'id'})),
  );

  public folder = 'dprk';

  constructor(private activatedRoute: ActivatedRoute,
              private storage: Storage,
              private firestore: Firestore,
              private dialog: MatDialog) {
  }

  public openImage(url: string) {
    this.dialog.open(DialogImageComponent, {data: {url}});
  }

}

@NgModule({
  imports: [CommonModule],
  declarations: [ArticleListComponent],
  exports: [ArticleListComponent]
})
export class ArticleListModule {
}
