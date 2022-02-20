import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, NgModule, ViewChild} from '@angular/core';
import {collection, collectionData, CollectionReference, doc, Firestore, setDoc} from '@angular/fire/firestore';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {Observable} from 'rxjs';
import {RouterModule} from "@angular/router";
import {GalleryData} from 'src/app/shared/gallery/GalleryData';

@Component({
  selector: 'app-admin-galleries',
  templateUrl: './admin-galleries.component.html',
  styleUrls: ['./admin-galleries.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminGalleriesComponent {

  @ViewChild('dialogCreateGallery', {static: true})
  dialogCreateGallery: any;

  collection = collection(this.firestore, 'galleries') as CollectionReference<GalleryData>;
  docs$ = collectionData<GalleryData>(this.collection, {idField: 'id'});

  doc$: Observable<GalleryData> | undefined;

  name = '';

  constructor(
    private firestore: Firestore,
    private dialog: MatDialog
  ) {
  }

  openDialog() {
    this.dialog.open(this.dialogCreateGallery);
  }

  onCreate(name: string) {
    setDoc<any>(doc(this.collection, name.toLowerCase()), {name, photos: []});
  }
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule,
  ],
  declarations: [AdminGalleriesComponent],
  exports: [AdminGalleriesComponent]
})
export class AdminGalleriesComponentModule {
}
