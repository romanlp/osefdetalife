import { Component, Inject } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dialog-image',
  templateUrl: './dialog-image.component.html',
  styleUrls: ['./dialog-image.component.scss']
})
export class DialogImageComponent {
  public imageUrl$: Observable<string>;

  constructor(private storage: AngularFireStorage,
              @Inject(MAT_DIALOG_DATA) private data: { folder: string, image: string }) {
    this.imageUrl$ = this.storage.ref(`${this.data.folder}/${this.data.image}.jpg`).getDownloadURL();
  }
}
