import { PlatformModule } from '@angular/cdk/platform';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { getAnalytics, provideAnalytics } from '@angular/fire/analytics';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { initializeAppCheck, provideAppCheck, ReCaptchaV3Provider } from '@angular/fire/app-check';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getPerformance, providePerformance } from '@angular/fire/performance';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { getApp } from 'firebase/app';
import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/routing/app-routing.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
} else {
  //@ts-ignore
  window['FIREBASE_APPCHECK_DEBUG_TOKEN'] = environment.appCheckToken;
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      AppRoutingModule,
      PlatformModule,
      provideFirebaseApp(() => initializeApp(environment.firebase)),
      provideFirestore(() => getFirestore()),
      provideAuth(() => getAuth()),
      provideAppCheck(() => initializeAppCheck(getApp(), {
        provider: new ReCaptchaV3Provider(environment.recaptcha),
        isTokenAutoRefreshEnabled: true
      })),
      providePerformance(() => getPerformance()),
      provideStorage(() => getStorage()),
      provideAnalytics(() => getAnalytics())
    ),
    provideAnimations()
  ]
})
  .catch(err => console.log(err));
