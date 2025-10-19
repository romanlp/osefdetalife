import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminHeaderComponent } from './admin-header/admin-header.component';

@Component({
  selector: 'osef-admin',
  template: `
    <osef-admin-header></osef-admin-header>
    <router-outlet></router-outlet>
  `,
  imports: [AdminHeaderComponent, RouterOutlet],
})
export class AdminComponent {
  constructor() {}
}
