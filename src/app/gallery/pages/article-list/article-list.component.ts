import { AsyncPipe, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { collection, CollectionReference, doc, docData, Firestore } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute } from "@angular/router";
import { map, switchMap } from "rxjs/operators";
import { DialogImageComponent } from '../../../shared/dialog-image/dialog-image.component';
import { GalleryData } from "../../../shared/gallery/GalleryData";


@Component({
  selector: 'osef-gallery-item',
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    AsyncPipe,
    NgOptimizedImage,
    MatDialogModule
  ]
})
export class ArticleListComponent {

  collection = collection(this.firestore, 'galleries') as CollectionReference<GalleryData>;

  document$ = this.activatedRoute.params.pipe(
    map((params) => params['id']),
    switchMap((id) => docData<GalleryData>(doc(this.collection, id), {idField: 'id'})),
  );

  constructor(private activatedRoute: ActivatedRoute,
              private storage: Storage,
              private firestore: Firestore,
              private dialog: MatDialog) {
  }

  public openImage(url: string) {
    this.dialog.open(DialogImageComponent, {data: {url}});
  }

}
