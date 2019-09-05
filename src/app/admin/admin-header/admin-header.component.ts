import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { User } from 'firebase';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss']
})
export class AdminHeaderComponent {

  public user$: Observable<User | null>;

  constructor(private auth: AngularFireAuth, private router: Router) {
    this.user$ = this.auth.authState;
  }

  public logout() {
    this.auth.auth.signOut();
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
