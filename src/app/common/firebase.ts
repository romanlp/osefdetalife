import {
  EnvironmentProviders,
  inject,
  Injectable,
  InjectionToken,
  Injector,
  makeEnvironmentProviders,
  PLATFORM_ID,
  VERSION,
} from '@angular/core';
import { registerVersion, type FirebaseApp } from 'firebase/app';
import {
  initializeAppCheck,
  type AppCheck,
  ReCaptchaV3Provider,
} from 'firebase/app-check';
import { getAnalytics, type Analytics } from 'firebase/analytics';
import {
  getPerformance,
  type FirebasePerformance,
} from 'firebase/performance';
import { environment } from '../../environments/environment';
import { getApp } from 'firebase/app';


/**
 * Injection token for the Firebase app instance.
 */
export const PROVIDED_FIREBASE_APP = new InjectionToken<FirebaseApp>(
  'FIREBASE_APP',
);

/**
 * Injection token for the Firebase App Check instance.
 */
export const APP_CHECK = new InjectionToken<AppCheck>('APP_CHECK');

/**
 * Injection token for the Firebase Analytics instance.
 */
export const ANALYTICS = new InjectionToken<Analytics>('ANALYTICS');

/**
 * Injection token for the Firebase Performance Monitoring instance.
 */
export const PERFORMANCE = new InjectionToken<FirebasePerformance>('PERFORMANCE');

function firebaseAppFactory(fn: (injector: Injector) => FirebaseApp) {
  return (injector: Injector) => {
    const platformId = inject(PLATFORM_ID);
    registerVersion('angularfire', VERSION.full, 'core');
    registerVersion('angularfire', VERSION.full, 'app');

    return fn(injector);
  };
}

export function provideFirebaseApp(
  fn: (injector: Injector) => FirebaseApp,
  ...deps: any[]
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: PROVIDED_FIREBASE_APP,
      useFactory: firebaseAppFactory(fn),
      deps: [Injector, ...deps],
    },
  ]);
}

export function provideAppCheck(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: APP_CHECK,
      useFactory: () => {
        const app = inject(PROVIDED_FIREBASE_APP);
        return initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider(environment.recaptcha),
          isTokenAutoRefreshEnabled: true,
        });
      },
    },
  ]);
}

export function provideAnalytics(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: ANALYTICS,
      useFactory: () => {
        const app = inject(PROVIDED_FIREBASE_APP);
        return getAnalytics(app);
      },
      deps: [PROVIDED_FIREBASE_APP],
    },
  ]);
}

export function providePerformance(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: PERFORMANCE,
      useFactory: () => {
        const app = inject(PROVIDED_FIREBASE_APP);
        return getPerformance(app);
      },
            deps: [PROVIDED_FIREBASE_APP],
    },
  ]);
}


@Injectable({
  providedIn: 'root',
})
export class Firebase {
  public appTest = getApp();
  public app = inject(PROVIDED_FIREBASE_APP);
  public appCheck = inject(APP_CHECK);
  public analytics = inject(ANALYTICS);
  public performance = inject(PERFORMANCE);
}
