import { PlatformModule } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import { Inject, NgModule } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { initializeAppCheck, provideAppCheck, ReCaptchaV3Provider } from "@angular/fire/app-check";
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAnalytics, getAnalytics } from '@angular/fire/analytics';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getPerformance, providePerformance } from '@angular/fire/performance';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { HomeModule } from './home/home.component';
import { AppRoutingModule } from './routing/app-routing.module';
import { ThemingService } from './theming.service';
import { getApp } from 'firebase/app';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    PlatformModule,
    HomeModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideAppCheck(() => initializeAppCheck(getApp(),
      { provider: new ReCaptchaV3Provider(environment.recaptcha), isTokenAutoRefreshEnabled: true })),
    providePerformance(() => getPerformance()),
    provideStorage(() => getStorage()),
    provideAnalytics(() => getAnalytics()),
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor(@Inject(DOCUMENT) document: Document,
    themeService: ThemingService) {

    themeService.theme$.subscribe((theme: string) => {
      document.body.className = theme;
    });
  }
}
