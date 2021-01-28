import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, NgModule, OnInit } from '@angular/core';

@Component({
  selector: 'app-gallery-home',
  templateUrl: './gallery-home.component.html',
  styleUrls: ['./gallery-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryHomeComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
  }

}

@NgModule({
  imports: [CommonModule],
  declarations: [GalleryHomeComponent],
  exports: [GalleryHomeComponent]
})
export class GalleryHomeModule {
}
