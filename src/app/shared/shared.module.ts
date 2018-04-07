import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DialogImageComponent} from './dialog-image/dialog-image.component';
import {MatButtonModule, MatDialogModule, MatIconModule, MatMenuModule, MatToolbarModule} from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule, MatToolbarModule, MatIconModule, MatMenuModule, MatDialogModule,
  ],
  exports: [
    MatButtonModule, MatToolbarModule, MatIconModule, MatMenuModule, MatDialogModule,
  ],
  entryComponents: [DialogImageComponent],
  declarations: [DialogImageComponent],
})
export class SharedModule {
}
