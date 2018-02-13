import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-dialog-image',
  templateUrl: './dialog-image.component.html',
  styleUrls: ['./dialog-image.component.scss']
})
export class DialogImageComponent implements OnInit {
  public imageUrl: string;

  constructor(private dialogRef: MatDialogRef<DialogImageComponent>,
              @Inject(MAT_DIALOG_DATA) private data: any) {
  }

  ngOnInit() {
    this.imageUrl = this.data;
  }

}
