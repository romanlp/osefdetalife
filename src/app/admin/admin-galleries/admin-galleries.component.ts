import { Component, OnInit, ChangeDetectionStrategy, NgModule } from '@angular/core';

@Component({
  selector: 'app-admin-galleries',
  templateUrl: './admin-galleries.component.html',
  styleUrls: ['./admin-galleries.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminGalleriesComponent {

  constructor() { }

}

@NgModule({
  imports: [],
  declarations: [AdminGalleriesComponent],
  exports: [AdminGalleriesComponent]
})
export class AdminGalleriesComponentModule { }