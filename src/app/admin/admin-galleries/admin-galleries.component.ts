import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, NgModule } from '@angular/core';
import { Firestore, onSnapshot, collection, docSnapshots, collectionSnapshots } from '@angular/fire/firestore';
import { doc } from 'firebase/firestore';

@Component({
  selector: 'app-admin-galleries',
  templateUrl: './admin-galleries.component.html',
  styleUrls: ['./admin-galleries.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminGalleriesComponent {

  doc = collection(this.firestore, 'galleries');

  docs$ = collectionSnapshots(this.doc);

  constructor(private firestore: Firestore) { }

}

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [AdminGalleriesComponent],
  exports: [AdminGalleriesComponent]
})
export class AdminGalleriesComponentModule { }