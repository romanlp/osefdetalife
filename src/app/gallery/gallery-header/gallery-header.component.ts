import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, NgModule, OnInit } from '@angular/core';

@Component({
  selector: 'app-gallery-header',
  templateUrl: './gallery-header.component.html',
  styleUrls: ['./gallery-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryHeaderComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
  }

}

@NgModule({
  imports: [CommonModule],
  declarations: [GalleryHeaderComponent],
  exports: [GalleryHeaderComponent]
})
export class GalleryHeaderModule {
}
