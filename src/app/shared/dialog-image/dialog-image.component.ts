import { NgOptimizedImage } from "@angular/common";
import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'osef-dialog-image',
  templateUrl: './dialog-image.component.html',
  styleUrls: ['./dialog-image.component.scss'],
  standalone: true,
  imports: [
    NgOptimizedImage
  ]
})
export class DialogImageComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: { url: string }) {
  }
}
