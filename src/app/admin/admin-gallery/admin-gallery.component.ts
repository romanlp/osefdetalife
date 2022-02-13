import {Component} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {map, switchMap} from 'rxjs/operators';
import {collection, CollectionReference, doc, docData, Firestore} from "@angular/fire/firestore";
import {getDownloadURL, ref, Storage, uploadBytes} from '@angular/fire/storage';

interface GalleryData {
  id: string;
  name: string;
  photos: string[];
}

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
    map((doc) => ({
      ...doc,
      photos: doc.photos.map((photo) => ({
        name: photo,
        url: getDownloadURL(ref(this.storage, `${doc.id}/${photo}`))
      }))
    }))
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
      console.log('Uploaded a blob or file!');
    });
  }
}
