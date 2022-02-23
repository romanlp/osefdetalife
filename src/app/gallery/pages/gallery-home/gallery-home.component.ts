import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, NgModule} from '@angular/core';

@Component({
  selector: 'osef-gallery-home',
  templateUrl: './gallery-home.component.html',
  styleUrls: ['./gallery-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryHomeComponent {

  constructor() {
  }

}

@NgModule({
  imports: [CommonModule],
  declarations: [GalleryHomeComponent],
  exports: [GalleryHomeComponent]
})
export class GalleryHomeModule {
}
