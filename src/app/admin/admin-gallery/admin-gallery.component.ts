import { CdkDropList } from "@angular/cdk/drag-drop";
import { AsyncPipe, NgForOf, NgIf, NgOptimizedImage } from "@angular/common";
import { Component, inject } from '@angular/core';
import { arrayUnion, collection, doc, docData, Firestore, updateDoc } from "@angular/fire/firestore";
import { getDownloadURL, ref, Storage, uploadBytes } from '@angular/fire/storage';
import { MatCardModule } from "@angular/material/card";
import { MatGridListModule } from "@angular/material/grid-list";
import { ActivatedRoute } from "@angular/router";
import { map, switchMap } from 'rxjs/operators';
import { GalleryData } from "../../shared/gallery/GalleryData";

@Component({
    selector: 'osef-admin-gallery',
    templateUrl: './admin-gallery.component.html',
    styleUrls: ['./admin-gallery.component.scss'],
    imports: [
        NgIf,
        NgForOf,
        AsyncPipe,
        MatGridListModule,
        MatCardModule,
        CdkDropList,
        NgOptimizedImage
    ]
})
export class AdminGalleryComponent {

  firestore: Firestore = inject(Firestore);
  storage: Storage = inject(Storage);
  collection = collection(this.firestore, 'galleries');

  document$ = this.activatedRoute.params.pipe(
    map((params) => params['id']),
    switchMap((id) => docData<GalleryData>(doc(this.collection, id), {idField: 'id'})),
  );

  constructor(private activatedRoute: ActivatedRoute) {
  }

  uploadImage(id: string, event: Event) {

    // @ts-ignore
    const image = (event.target as HTMLInputElement).files[0];

    const storageRef = ref(this.storage, `${id}/${image.name}`);

    console.log(id, storageRef);

    uploadBytes(storageRef, image).then(() => {
      getDownloadURL(storageRef).then((link) => {
        updateDoc(doc(this.collection, id), {
          photos: arrayUnion({name: image.name, url: link})
        })
      });
    });
  }
}
