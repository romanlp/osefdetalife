import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, NgModule, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router, RouterModule } from '@angular/router';
import firebase from 'firebase/compat/app';

@Component({
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPageComponent implements OnInit {

  constructor(private authService: AngularFireAuth, private router: Router) {
  }

  ngOnInit() {
  }

  public login() {
    this.authService.signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then(() => this.router.navigate(['admin']))
      .catch(error => console.error(error));
  }
}

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: LoginPageComponent }]),
  ],
  declarations: [LoginPageComponent],
  exports: [LoginPageComponent]
})
export class LoginPageModule {
}
