import { Component, Inject } from '@angular/core';
import { Storage, ref, getDownloadURL } from '@angular/fire/storage';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dialog-image',
  templateUrl: './dialog-image.component.html',
  styleUrls: ['./dialog-image.component.scss']
})
export class DialogImageComponent {
  public imageUrl$: Promise<string>;

  constructor(@Inject(MAT_DIALOG_DATA) private data: { folder: string, image: string },
              private storage: Storage) {
    const storageRef = ref(this.storage, `${this.data.folder}/${this.data.image}.jpg`)
    this.imageUrl$ = getDownloadURL(storageRef);
  }
}
