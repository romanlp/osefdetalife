import { Component, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInput, MatFormField, MatLabel } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  templateUrl: './reset-password-page.component.html',
  styleUrls: ['./reset-password-page.component.scss'],
  imports: [MatButton, MatCardModule, MatInput, MatFormField, MatLabel, FormsModule, RouterLink],
})
export class ResetPasswordPageComponent {
  private authService = inject(AuthService);

  email = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  sent = signal(false);

  async sendResetEmail() {
    if (!this.email()) {
      this.error.set('Please enter your email');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      await this.authService.sendPasswordReset(this.email());
      this.sent.set(true);
    } catch (e: unknown) {
      console.error('Password reset failed:', e);
      const code = e && typeof e === 'object' && 'code' in e ? (e as { code: string }).code : undefined;
      if (code === 'auth/user-not-found') {
        this.sent.set(true);
      } else {
        this.error.set(this.authService.getErrorMessage(code));
      }
    } finally {
      this.loading.set(false);
    }
  }
}
