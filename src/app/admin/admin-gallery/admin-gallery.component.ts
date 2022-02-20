import {Component} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {map, switchMap} from 'rxjs/operators';
import {arrayUnion, collection, CollectionReference, doc, docData, Firestore, updateDoc} from "@angular/fire/firestore";
import {getDownloadURL, ref, Storage, uploadBytes} from '@angular/fire/storage';
import { GalleryData } from 'src/app/shared/gallery/GalleryData';

@Component({
  selector: 'app-admin-gallery',
  templateUrl: './admin-gallery.component.html',
  styleUrls: ['./admin-gallery.component.scss']
})
export class AdminGalleryComponent {

  collection = collection(this.firestore, 'galleries') as CollectionReference<GalleryData>;

  document$ = this.activatedRoute.params.pipe(
    map((params) => params['id']),
    switchMap((id) => docData<GalleryData>(doc(this.collection, id), {idField: 'id'})),
  );

  constructor(
    private firestore: Firestore,
    private storage: Storage,
    private activatedRoute: ActivatedRoute
  ) {
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
