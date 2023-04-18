import { Injectable } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { Route, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatedGuard  {

  constructor(private router: Router, private auth: Auth) {
  }

  canLoad(route: Route): Observable<boolean> {
    const authState2 = authState(this.auth).pipe(map((user) => !!user));
    if (route.path === 'admin') {
      return authState2.pipe(
        tap((auth) => !auth ? this.router.navigate(['/', 'login']) : console.log('access granted')),
        take(1)
      );
    }
    if (route.path === 'login') {
      return authState2.pipe(
        map((auth) => !auth),
        tap((auth) => !auth ? this.router.navigate(['/', 'admin']) : console.log('access granted')),
        take(1)
      );
    }
    return of(false);
  }
}
