import {
  getSupportedInputTypes,
  supportsPassiveEventListeners,
} from '@angular/cdk/platform';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatAnchor, MatButton } from '@angular/material/button';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AddressComponent } from '../../address/address.component';

@Component({
  selector: 'osef-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, MatButton, MatAnchor, AddressComponent],
})
export class HomeComponent {
  private _ruler = inject(ViewportRuler);

  public viewportSize: { width: number; height: number };
  public viewportScrollPosition: { top: number; left: number };
  public supportPassiveEvent: boolean;
  public supportedInputTypes: Set<string>;
  public viewportWidth$: Observable<number>;
  public viewportHeight$: Observable<number>;

  constructor() {
    this.supportPassiveEvent = supportsPassiveEventListeners();
    this.supportedInputTypes = getSupportedInputTypes();

    // { width, height }
    this.viewportSize = this._ruler.getViewportSize();

    // { top, left }
    this.viewportScrollPosition = this._ruler.getViewportScrollPosition();

    // native resize event object
    this.viewportWidth$ = this._ruler
      .change()
      .pipe(map((event) => (event.target as Window).innerWidth));

    // native resize event object
    this.viewportHeight$ = this._ruler
      .change()
      .pipe(map((event) => (event.target as Window).innerHeight));
  }
}
