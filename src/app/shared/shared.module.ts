import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DialogImageComponent} from './dialog-image/dialog-image.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  entryComponents: [DialogImageComponent],
  declarations: [DialogImageComponent],
})
export class SharedModule {
}
