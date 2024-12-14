import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { CollectionReference, Firestore, collection, collectionData, doc, setDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from "@angular/material/list";
import { RouterModule } from "@angular/router";
import { GalleryData } from "../../shared/gallery/GalleryData";

@Component({
    selector: 'osef-admin-galleries',
    templateUrl: './admin-galleries.component.html',
    styleUrls: ['./admin-galleries.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        RouterModule,
        MatListModule,
        MatIconModule,
    ]
})
export class AdminGalleriesComponent {

  @ViewChild('dialogCreateGallery', { static: true })
  dialogCreateGallery: any;

  collection = collection(this.firestore, 'galleries') as CollectionReference<GalleryData>;
  docs$ = collectionData<GalleryData>(this.collection, { idField: 'id' });

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
    setDoc<any, any>(doc(this.collection, name.toLowerCase()), { name, photos: [] });
  }
}
