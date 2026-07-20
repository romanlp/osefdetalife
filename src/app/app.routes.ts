import { Routes } from '@angular/router';
import {
  isAuthenticatedGuard,
  isNotAuthenticatedGuard,
} from './routing/guard/authenticated.guard';
import { isOnboardedGuard, isNotOnboardedGuard } from './routing/guard/onboarding.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login-page/login-page.component').then(
        (m) => m.LoginPageComponent,
      ),
    canActivate: [isNotAuthenticatedGuard],
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./login/signup-page/signup-page.component').then(
        (m) => m.SignupPageComponent,
      ),
    canActivate: [isNotAuthenticatedGuard],
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./login/reset-password-page/reset-password-page.component').then(
        (m) => m.ResetPasswordPageComponent,
      ),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('../dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
    canActivate: [isAuthenticatedGuard, isOnboardedGuard],
  },
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./onboarding/onboarding-page/onboarding-page.component').then(
        (m) => m.OnboardingPageComponent,
      ),
    canActivate: [isAuthenticatedGuard, isNotOnboardedGuard],
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
