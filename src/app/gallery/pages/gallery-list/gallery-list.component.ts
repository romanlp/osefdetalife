import {Component} from '@angular/core';
import {collection, collectionData, CollectionReference, Firestore} from "@angular/fire/firestore";
import {GalleryData} from "../../../shared/gallery/GalleryData";

@Component({
  selector: 'osef-gallery-list',
  templateUrl: './gallery-list.component.html',
  styleUrls: ['./gallery-list.component.scss']
})
export class GalleryListComponent {

  collection = collection(this.firestore, 'galleries') as CollectionReference<GalleryData>;
  docs$ = collectionData<GalleryData>(this.collection, {idField: 'id'});

  name = '';

  constructor(
    private firestore: Firestore
  ) {
  }
}
