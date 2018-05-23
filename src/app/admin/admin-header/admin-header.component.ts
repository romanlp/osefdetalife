import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import * as firebase from 'firebase';
import {AngularFireAuth} from 'angularfire2/auth';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss']
})
export class AdminHeaderComponent implements OnInit {

  public user$: Observable<firebase.User>;

  constructor(private auth: AngularFireAuth) {
  }

  ngOnInit() {
    this.user$ = this.auth.authState;
  }

  public login() {
    this.auth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then(logged => console.log(logged))
      .catch(error => console.error(error));
  }

  public logout() {
    this.auth.auth.signOut();
  }

}
