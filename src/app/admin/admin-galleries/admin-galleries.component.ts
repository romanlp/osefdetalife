import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  collection,
  CollectionReference,
  doc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { Firebase } from '../../common/firebase';
import { GalleryData } from '../../shared/gallery/GalleryData';

@Component({
  selector: 'osef-admin-galleries',
  templateUrl: './admin-galleries.component.html',
  styleUrls: ['./admin-galleries.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule,
    MatListModule,
    MatIconModule,
  ],
})
export class AdminGalleriesComponent {
  private firebase = inject(Firebase);
  private dialog = inject(MatDialog);

  @ViewChild('dialogCreateGallery', { static: true })
  dialogCreateGallery: any;

  private galleryCollection = collection(
    this.firebase.firestore,
    'galleries',
  ) as CollectionReference<GalleryData>;

  docs = signal<GalleryData[]>([]);

  name = '';

  constructor() {
    effect((onCleanup) => {
      const unsub = onSnapshot(this.galleryCollection, (snapshot) => {
        this.docs.set(
          snapshot.docs.map((d) => ({
            ...d.data(),
            id: d.id,
          })) as GalleryData[],
        );
      });

      onCleanup(() => unsub());
    });
  }

  openDialog() {
    this.dialog.open(this.dialogCreateGallery);
  }

  onCreate(name: string) {
    setDoc<any, any>(doc(this.galleryCollection, name.toLowerCase()), {
      name,
      photos: [],
    });
  }
}
