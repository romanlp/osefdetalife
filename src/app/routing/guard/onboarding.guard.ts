import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getFirebaseDb, getFirebaseAuth } from '../../../shared/firebase-config';

export const isOnboardedGuard: CanActivateFn = async () => {
  const router = inject(Router);

  try {
    const user = getFirebaseAuth().currentUser;
    if (!user) return router.parseUrl('/login');

    const db = getFirebaseDb();
    const q = query(collection(db, 'restaurants'), where('ownerId', '==', user.uid));
    const snapshot = await getDocs(q);

    return !snapshot.empty || router.parseUrl('/onboarding');
  } catch {
    return router.parseUrl('/onboarding');
  }
};

export const isNotOnboardedGuard: CanActivateFn = async () => {
  const router = inject(Router);

  try {
    const user = getFirebaseAuth().currentUser;
    if (!user) return router.parseUrl('/login');

    const db = getFirebaseDb();
    const q = query(collection(db, 'restaurants'), where('ownerId', '==', user.uid));
    const snapshot = await getDocs(q);

    return snapshot.empty || router.parseUrl('/dashboard');
  } catch {
    return true;
  }
};
