import { Component, OnInit, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gallery-header',
  templateUrl: './gallery-header.component.html',
  styleUrls: ['./gallery-header.component.scss']
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
