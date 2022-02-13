import {Component} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {map} from 'rxjs/operators';
import {collection, CollectionReference, doc, docData, Firestore} from "@angular/fire/firestore";

interface GalleryData {
  id: string;
  name: string;
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
    map((id) => docData<GalleryData>(doc(this.collection, id)))
  );

  constructor(
    private firestore: Firestore,
    private activatedRoute: ActivatedRoute
  ) {
  }
}
