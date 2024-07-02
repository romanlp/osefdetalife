import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { getAnalytics, provideAnalytics } from "@angular/fire/analytics";
import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { initializeAppCheck, provideAppCheck, ReCaptchaV3Provider } from "@angular/fire/app-check";
import { getAuth, provideAuth } from "@angular/fire/auth";
import { getFirestore, provideFirestore } from "@angular/fire/firestore";
import { getPerformance, providePerformance } from "@angular/fire/performance";
import { getStorage, provideStorage } from "@angular/fire/storage";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideRouter } from '@angular/router';
import { environment } from "../environments/environment";

import { routes } from './routing/app-routing.module';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideAppCheck(() => initializeAppCheck(undefined, {
      provider: new ReCaptchaV3Provider(environment.recaptcha),
      isTokenAutoRefreshEnabled: true
    })),
    providePerformance(() => getPerformance()),
    provideStorage(() => getStorage()),
    provideAnalytics(() => getAnalytics()),
    provideAnimations()
  ]
};
