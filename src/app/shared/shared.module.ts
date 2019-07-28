import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DialogImageComponent} from './dialog-image/dialog-image.component';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatDialogModule} from '@angular/material/dialog';
import {MatListModule} from '@angular/material/list';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule, MatToolbarModule, MatIconModule, MatDialogModule,
    MatListModule
  ],
  exports: [
    MatButtonModule, MatToolbarModule, MatIconModule, MatDialogModule,
    MatListModule
  ],
  entryComponents: [DialogImageComponent],
  declarations: [DialogImageComponent],
})
export class SharedModule {
}
