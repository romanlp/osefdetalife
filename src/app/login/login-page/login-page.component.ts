import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { RouterModule } from '@angular/router';
import { auth } from 'firebase/app';

@Component({
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  constructor(private authService: AngularFireAuth) { }

  ngOnInit() {
  }

  public login() {
    this.authService.auth.signInWithPopup(new auth.GoogleAuthProvider())
      .then(logged => console.log(logged))
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
