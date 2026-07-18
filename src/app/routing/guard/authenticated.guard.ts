import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, getAuth } from 'firebase/auth';

function getCurrentUser(auth: Auth) {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
}

export const isAuthenticatedGuard: CanActivateFn = async () => {
  const router = inject(Router);

  try {
    const auth = getAuth();
    const user = await getCurrentUser(auth);
    return !!user || router.parseUrl('/login');
  } catch {
    return router.parseUrl('/login');
  }
};

export const isNotAuthenticatedGuard: CanActivateFn = async () => {
  const router = inject(Router);

  try {
    const auth = getAuth();
    const user = await getCurrentUser(auth);
    return !user || router.parseUrl('/dashboard');
  } catch {
    return router.parseUrl('/dashboard');
  }
};
