import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss']
})
export class AdminHeaderComponent {

  public applicationTitle = 'Osefdetalife';

  constructor(private auth: AngularFireAuth, private router: Router) {
  }

  public logout() {
    this.auth.signOut();
    this.router.navigate(['login']);
  }
}

@NgModule({
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule],
  declarations: [AdminHeaderComponent],
  exports: [AdminHeaderComponent]
})
export class AdminHeaderModule {
}
