import { NgModule } from '@angular/core';

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


}
