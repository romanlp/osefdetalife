import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { User } from 'firebase';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss']
})
export class AdminHeaderComponent implements OnInit {

  public user$: Observable<User>;

  constructor(private auth: AngularFireAuth) {
  }

  ngOnInit() {
    this.user$ = this.auth.authState;
  }

  public logout() {
    this.auth.auth.signOut();
  }

}

@NgModule({
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule],
  declarations: [AdminHeaderComponent],
  exports: [AdminHeaderComponent]
})
export class AdminHeaderModule {
}
