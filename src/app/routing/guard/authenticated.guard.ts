import { inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';

export const AuthGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const authState2 = authState(auth).pipe(map((user) => !!user));

  return authState2.pipe(
    map((isAuthenticated) => {
      console.log('isAuthenticated:', isAuthenticated);
      if (route.routeConfig?.path === 'admin') {
        if (!isAuthenticated) {
          return router.parseUrl('/login');
        }
        return true;
      } else if (route.routeConfig?.path === 'login') {
        if (isAuthenticated) {
          router.parseUrl('/admin');
        }
        return true;
      }
      return true; // Allow access to other routes
    }),
  );
};
