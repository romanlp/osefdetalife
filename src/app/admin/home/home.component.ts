import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getSupportedInputTypes, supportsPassiveEventListeners } from '@angular/cdk/platform';
import { ViewportRuler } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public viewportSize: { width: number, height: number };
  public viewportRect: ClientRect;
  public viewportScrollPosition: { top: number; left: number };
  public supportPassiveEvent: boolean;
  public supportedInputTypes: Set<string>;
  public viewportWidth$: Observable<number>;
  public viewportHeight$: Observable<number>;

  constructor(private _ruler: ViewportRuler) {
  }

  ngOnInit() {
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
      .pipe(map(event => (event.target as Window).innerWidth));

    // native resize event object
    this.viewportHeight$ = this._ruler.change()
      .pipe(map(event => (event.target as Window).innerHeight));
  }

}
