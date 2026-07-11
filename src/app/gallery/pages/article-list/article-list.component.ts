import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  collection,
  CollectionReference,
  doc,
  onSnapshot,
} from 'firebase/firestore';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { Firebase } from '../../../common/firebase';
import { DialogImageComponent } from '../../../shared/dialog-image/dialog-image.component';
import { GalleryData } from '../../../shared/gallery/GalleryData';

@Component({
  selector: 'osef-gallery-item',
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, MatDialogModule],
})
export class ArticleListComponent {
  private activatedRoute = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private firebase = inject(Firebase);

  private galleryCollection = collection(
    this.firebase.firestore,
    'galleries',
  ) as CollectionReference<GalleryData>;

  private idParam = toSignal(
    this.activatedRoute.params.pipe(map((params) => params['id'] as string)),
  );

  document = signal<GalleryData | undefined>(undefined);

  constructor() {
    effect((onCleanup) => {
      const id = this.idParam();
      if (!id) return;

      const docRef = doc(this.galleryCollection, id);
      const unsub = onSnapshot(docRef, (snapshot) => {
        this.document.set({
          id: snapshot.id,
          ...snapshot.data(),
        } as GalleryData);
      });

      onCleanup(() => unsub());
    });
  }

  public openImage(url: string) {
    this.dialog.open(DialogImageComponent, { data: { url } });
  }
}
