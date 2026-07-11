import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { initializeApp } from 'firebase/app';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import {
  provideAnalytics,
  provideAppCheck,
  providePerformance,
  provideFirebaseApp,
  provideFirestore,
  provideStorage,
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
    provideFirestore(),
    provideStorage(),
  ],
};
