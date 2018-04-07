import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DialogImageComponent} from './dialog-image/dialog-image.component';
import {MatButtonModule, MatDialogModule, MatIconModule, MatListModule, MatMenuModule, MatToolbarModule} from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule, MatToolbarModule, MatIconModule, MatMenuModule, MatDialogModule,
    MatListModule
  ],
  exports: [
    MatButtonModule, MatToolbarModule, MatIconModule, MatMenuModule, MatDialogModule,
    MatListModule
  ],
  entryComponents: [DialogImageComponent],
  declarations: [DialogImageComponent],
})
export class SharedModule {
}
