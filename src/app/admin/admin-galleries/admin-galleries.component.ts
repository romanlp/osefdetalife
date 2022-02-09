import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-admin-galleries',
  templateUrl: './admin-galleries.component.html',
  styleUrls: ['./admin-galleries.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminGalleriesComponent {

  doc = collection(this.firestore, 'galleries');

  docs$ = collectionData(this.doc);

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