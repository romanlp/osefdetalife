import { Component, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInput, MatFormField, MatLabel } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss'],
  imports: [MatButton, MatCardModule, MatInput, MatFormField, MatLabel, FormsModule, RouterLink],
})
export class SignupPageComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  verificationEmailSent = signal(false);

  async signUpWithEmail() {
    if (!this.email()) {
      this.error.set('Please enter your email');
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.error.set('Passwords do not match');
      return;
    }

    if (this.password().length < 6) {
      this.error.set('Password must be at least 6 characters');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      await this.authService.signUpWithEmail(this.email(), this.password());
      this.verificationEmailSent.set(true);
    } catch (e: unknown) {
      console.error('Sign up failed:', e);
      const code = e && typeof e === 'object' && 'code' in e ? (e as { code: string }).code : undefined;
      this.error.set(this.authService.getErrorMessage(code));
    } finally {
      this.loading.set(false);
    }
  }

  async signUpWithGoogle() {
    this.loading.set(true);
    this.error.set(null);

    try {
      await this.authService.signInWithGoogle();
      const isFirst = await this.authService.isFirstSignIn();
      this.router.navigate(isFirst ? ['/onboarding'] : ['/dashboard']);
    } catch (e: unknown) {
      console.error('Google sign-up failed:', e);
      const code = e && typeof e === 'object' && 'code' in e ? (e as { code: string }).code : undefined;
      this.error.set(this.authService.getErrorMessage(code));
    } finally {
      this.loading.set(false);
    }
  }
}
