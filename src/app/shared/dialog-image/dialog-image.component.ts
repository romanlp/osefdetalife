import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-image',
  templateUrl: './dialog-image.component.html',
  styleUrls: ['./dialog-image.component.scss']
})
export class DialogImageComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: { url: string }) {
  }
}
