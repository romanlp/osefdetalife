import { Component } from '@angular/core';

@Component({
  selector: 'osef-admin',
  template: `
    <osef-admin-header></osef-admin-header>
    <router-outlet></router-outlet>
  `
})
export class AdminComponent {

  constructor() {
  }

}
