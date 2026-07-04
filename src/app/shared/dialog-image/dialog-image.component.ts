import { NgOptimizedImage } from "@angular/common";
import {Component, Inject, ChangeDetectionStrategy} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
    selector: 'osef-dialog-image',
    templateUrl: './dialog-image.component.html',
    styleUrls: ['./dialog-image.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        NgOptimizedImage
    ]
})
export class DialogImageComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: { url: string }) {
  }
}
