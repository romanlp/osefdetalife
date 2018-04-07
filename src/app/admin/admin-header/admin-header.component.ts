import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
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

}
