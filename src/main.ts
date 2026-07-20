import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { initializeApp } from 'firebase/app';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';
import { connectToEmulators } from './shared/firebase-config';

initializeApp(environment.firebase);

if (environment.production) {
  enableProdMode();
} else {
  connectToEmulators();
  //@ts-expect-error error
  window['FIREBASE_APPCHECK_DEBUG_TOKEN'] = environment.appCheckToken;
}

bootstrapApplication(AppComponent, appConfig).catch((err) => console.log(err));
