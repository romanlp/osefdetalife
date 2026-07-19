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

    if (snapshot.empty) return router.parseUrl('/onboarding');

    const restaurantDoc = snapshot.docs[0];
    const data = restaurantDoc.data();
    return data['onboardingCompleted'] === true || router.parseUrl('/onboarding');
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

    if (snapshot.empty) return true;

    const restaurantDoc = snapshot.docs[0];
    const data = restaurantDoc.data();
    return data['onboardingCompleted'] !== true || router.parseUrl('/dashboard');
  } catch {
    return true;
  }
};
