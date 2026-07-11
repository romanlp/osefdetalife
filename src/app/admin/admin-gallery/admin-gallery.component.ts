import { CdkDropList } from '@angular/cdk/drag-drop';
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
  arrayUnion,
  collection,
  CollectionReference,
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import {
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { Firebase } from '../../common/firebase';
import { GalleryData } from '../../shared/gallery/GalleryData';

@Component({
  selector: 'osef-admin-gallery',
  templateUrl: './admin-gallery.component.html',
  styleUrls: ['./admin-gallery.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatGridListModule,
    MatCardModule,
    CdkDropList,
    NgOptimizedImage,
  ],
})
export class AdminGalleryComponent {
  private activatedRoute = inject(ActivatedRoute);
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

  uploadImage(id: string, event: Event) {
    // @ts-ignore
    const image = (event.target as HTMLInputElement).files[0];

    const storageRef = ref(this.firebase.storage, `${id}/${image.name}`);

    uploadBytes(storageRef, image).then(() => {
      getDownloadURL(storageRef).then((link) => {
        updateDoc(doc(this.galleryCollection, id), {
          photos: arrayUnion({ name: image.name, url: link }),
        });
      });
    });
  }
}
