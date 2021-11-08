import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, NgModule } from '@angular/core';

@Component({
  selector: 'app-gallery-header',
  templateUrl: './gallery-header.component.html',
  styleUrls: ['./gallery-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryHeaderComponent {

  constructor() {
  }

}

@NgModule({
  imports: [CommonModule],
  declarations: [GalleryHeaderComponent],
  exports: [GalleryHeaderComponent]
})
export class GalleryHeaderModule {
}
