import { Component, OnInit, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gallery-home',
  templateUrl: './gallery-home.component.html',
  styleUrls: ['./gallery-home.component.scss']
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
