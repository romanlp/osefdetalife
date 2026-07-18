import { Component, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInput, MatFormField, MatLabel } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  imports: [MatButton, MatCardModule, MatInput, MatFormField, MatLabel, FormsModule, RouterLink],
})
export class LoginPageComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  email = signal('');
  password = signal('');
  loading = signal(false);
  error = signal<string | null>(null);

  async loginWithEmail() {
    if (!this.email() || !this.password()) {
      this.error.set('Please enter email and password');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      await this.authService.signInWithEmail(this.email(), this.password());
      this.router.navigate(['/dashboard']);
    } catch (e: unknown) {
      console.error('Login failed:', e);
      const code = e && typeof e === 'object' && 'code' in e ? (e as { code: string }).code : undefined;
      this.error.set(this.authService.getErrorMessage(code));
    } finally {
      this.loading.set(false);
    }
  }

  async loginWithGoogle() {
    this.loading.set(true);
    this.error.set(null);

    try {
      await this.authService.signInWithGoogle();
      const isFirst = await this.authService.isFirstSignIn();
      this.router.navigate(isFirst ? ['/onboarding'] : ['/dashboard']);
    } catch (e: unknown) {
      console.error('Google sign-in failed:', e);
      const code = e && typeof e === 'object' && 'code' in e ? (e as { code: string }).code : undefined;
      this.error.set(this.authService.getErrorMessage(code));
    } finally {
      this.loading.set(false);
    }
  }
}
