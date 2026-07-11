import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { getAnalytics, provideAnalytics as provideAnalyticsLegacy } from '@angular/fire/analytics';
import {
  initializeApp as initializeAppLegacy,
  provideFirebaseApp as provideFirebaseAppLegacy,
} from '@angular/fire/app';
import {
  initializeAppCheck,
  provideAppCheck as provideAppCheckLegacy,
  ReCaptchaV3Provider,
} from '@angular/fire/app-check';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getPerformance, providePerformance as providePerformanceLegacy } from '@angular/fire/performance';

import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideRouter } from '@angular/router';
import { initializeApp } from 'firebase/app';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import {
  provideAnalytics,
  provideAppCheck,
  providePerformance,
  provideFirebaseApp,
} from './common/firebase';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideZoneChangeDetection({ eventCoalescing: true }),

    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAppCheck(),
    provideAnalytics(),
    providePerformance(),

    // Old Angularfire configuration for compatibility with existing code
    provideFirebaseAppLegacy(() => initializeAppLegacy(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAppCheckLegacy(() =>
      initializeAppCheck(undefined, {
        provider: new ReCaptchaV3Provider(environment.recaptcha),
        isTokenAutoRefreshEnabled: true,
      }),
    ),
    providePerformanceLegacy(() => getPerformance()),
    provideStorage(() => getStorage()),
    provideAnalyticsLegacy(() => getAnalytics()),
    // provideAppCheck(),
    // providePerformance(),
    provideStorage(() => getStorage()),
    // provideAnalytics(),
  ],
};
