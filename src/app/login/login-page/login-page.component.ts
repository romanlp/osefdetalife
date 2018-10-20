import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {

  constructor(private auth: AngularFireAuth) { }

  ngOnInit() {
  }

  public login() {
    this.auth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then(logged => console.log(logged))
      .catch(error => console.error(error));
  }

}
