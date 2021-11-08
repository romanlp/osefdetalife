import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { CanLoad, Route, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatedGuard implements CanLoad {

  constructor(private auth: AngularFireAuth, private router: Router) {
  }

  canLoad(route: Route): Observable<boolean> {
    const authState = this.auth.authState.pipe(map((user) => !!user));
    if (route.path === 'admin') {
      return authState.pipe(
        tap((auth) => !auth ? this.router.navigate(['/', 'login']) : console.log('access granted')),
        take(1)
      );
    }
    if (route.path === 'login') {
      return authState.pipe(
        map((auth) => !auth),
        tap((auth) => !auth ? this.router.navigate(['/', 'admin']) : console.log('access granted')),
        take(1)
      );
    }
    return of(false);
  }
}
