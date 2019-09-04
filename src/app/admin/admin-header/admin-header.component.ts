import { Component, OnInit, NgModule } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from 'firebase';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule, MatToolbarModule],
  declarations: [AdminHeaderComponent],
  exports: [AdminHeaderComponent]
})
export class AdminHeaderModule {
}
