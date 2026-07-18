import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInput, MatFormField, MatLabel } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  templateUrl: './reset-password-page.component.html',
  styleUrls: ['./reset-password-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatCardModule, MatInput, MatFormField, MatLabel, FormsModule, RouterLink],
})
export class ResetPasswordPageComponent {
  private authService = inject(AuthService);

  email = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  sent = signal(false);

  async sendResetEmail() {
    this.loading.set(true);
    this.error.set(null);

    try {
      await this.authService.sendPasswordReset(this.email());
      this.sent.set(true);
    } catch (e: any) {
      this.error.set(this.getErrorMessage(e.code));
    } finally {
      this.loading.set(false);
    }
  }

  private getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/invalid-email':
        return 'Invalid email address';
      default:
        return 'An error occurred. Please try again';
    }
  }
}
