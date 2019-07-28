import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AngularFireStorage} from '@angular/fire/storage';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-dialog-image',
  templateUrl: './dialog-image.component.html',
  styleUrls: ['./dialog-image.component.scss']
})
export class DialogImageComponent implements OnInit {
  public imageUrl$: Observable<string>;

  constructor(private dialogRef: MatDialogRef<DialogImageComponent>,
              private storage: AngularFireStorage,
              @Inject(MAT_DIALOG_DATA) private data: {folder: string, image: string}) {
  }

  ngOnInit() {
    this.imageUrl$ = this.storage.ref(`${this.data.folder}/${this.data.image}.jpg`).getDownloadURL();
  }

}
