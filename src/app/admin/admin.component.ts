import { Component } from '@angular/core';

@Component({
  selector: 'app-admin',
  template: `
    <app-admin-header></app-admin-header>
    <router-outlet></router-outlet>
  `
})
export class AdminComponent {

  constructor() {
  }

}
