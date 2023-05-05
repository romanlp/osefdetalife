import { DOCUMENT } from '@angular/common';
import { Inject, NgModule } from '@angular/core';
import { ThemingService } from './theming.service';

@NgModule(/* TODO(standalone-migration): clean up removed NgModule class manually.
{
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    PlatformModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideAppCheck(() => initializeAppCheck(getApp(),
      {provider: new ReCaptchaV3Provider(environment.recaptcha), isTokenAutoRefreshEnabled: true})),
    providePerformance(() => getPerformance()),
    provideStorage(() => getStorage()),
    provideAnalytics(() => getAnalytics()),
  ],
  bootstrap: [AppComponent]
} */)
export class AppModule {

  constructor(@Inject(DOCUMENT) document: Document,
              themeService: ThemingService) {

    themeService.theme$.subscribe((theme: string) => {
      document.body.className = theme;
    });
  }
}
