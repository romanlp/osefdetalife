import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './routing/app-routing.module';

import { PlatformModule } from '@angular/cdk/platform';
import { VIEWPORT_RULER_PROVIDER } from '@angular/cdk/scrolling';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFirePerformanceModule } from '@angular/fire/performance';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { GalleryModule } from './gallery/gallery.module';
import { HomeModule } from './home/home.component';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserModule.withServerTransition({ appId: 'romangular-firebase'}),
    BrowserAnimationsModule,
    AppRoutingModule,
    PlatformModule,
    CoreModule,
    SharedModule,
    GalleryModule,
    HomeModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFirePerformanceModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production}),
  ],
  providers: [VIEWPORT_RULER_PROVIDER],
  bootstrap: [AppComponent]
})
export class AppModule {
}
