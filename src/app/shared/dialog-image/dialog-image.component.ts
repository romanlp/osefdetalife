import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'osef-dialog-image',
  templateUrl: './dialog-image.component.html',
  styleUrls: ['./dialog-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgOptimizedImage],
})
export class DialogImageComponent {
  data = inject<{
    url: string;
  }>(MAT_DIALOG_DATA);
}
