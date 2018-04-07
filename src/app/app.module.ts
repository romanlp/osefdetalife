import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './routing/app-routing.module';

import {ServiceWorkerModule} from '@angular/service-worker';
import {AppComponent} from './app.component';

import {environment} from '../environments/environment';
import {PlatformModule} from '@angular/cdk/platform';
import {VIEWPORT_RULER_PROVIDER} from '@angular/cdk/scrolling';

import {AngularFireModule} from 'angularfire2';
import {AngularFireAuthModule} from 'angularfire2/auth';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AngularFireStorageModule} from 'angularfire2/storage';
import {CoreModule} from './core/core.module';
import {SharedModule} from './shared/shared.module';
import {GalleryModule} from './gallery/gallery.module';
import {AngularFirestoreModule} from 'angularfire2/firestore';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserModule.withServerTransition({appId: 'romangular-firebase'}),
    BrowserAnimationsModule,
    AppRoutingModule,
    PlatformModule,
    CoreModule,
    SharedModule,
    GalleryModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    ServiceWorkerModule.register('/ngsw-worker.js', {enabled: environment.production}),
  ],
  providers: [VIEWPORT_RULER_PROVIDER],
  bootstrap: [AppComponent]
})
export class AppModule {
}
