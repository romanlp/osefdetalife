import {Component, OnInit} from '@angular/core';
import {getSupportedInputTypes, Platform, supportsPassiveEventListeners} from '@angular/cdk/platform';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {Observable} from 'rxjs/Observable';
import {AngularFireAuth} from 'angularfire2/auth';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public title = 'app';
  public supportPassiveEvent: boolean;
  public supportedInputTypes: Set<string>;
  public viewportSize: { width: number, height: number };
  public viewportRect: ClientRect;
  public viewportScrollPosition: { top: number; left: number };
  public viewportWidth$: Observable<number>;
  public viewportHeight$: Observable<number>;
  public user$: Observable<firebase.User>;

  constructor(public _platform: Platform,
              private _ruler: ViewportRuler,
              private afAuth: AngularFireAuth) {
  }

  public login() {
    this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then(logged => console.log(logged))
      .catch(error => console.error(error));
  }

  public logout() {
    this.afAuth.auth.signOut();
  }

  ngOnInit(): void {
    this.user$ = this.afAuth.authState;
    this.supportPassiveEvent = supportsPassiveEventListeners();
    this.supportedInputTypes = getSupportedInputTypes();

    // { width, height }
    this.viewportSize = this._ruler.getViewportSize();

    // { bottom, height, left, right, top, width }
    this.viewportRect = this._ruler.getViewportRect();

    // { top, left }
    this.viewportScrollPosition = this._ruler.getViewportScrollPosition();

    // native resize event object
    this.viewportWidth$ = this._ruler.change()
      .map(event => (event.target as Window).innerWidth);

    // native resize event object
    this.viewportHeight$ = this._ruler.change()
      .map(event => (event.target as Window).innerHeight);
  }
}
