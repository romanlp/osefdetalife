import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

@Component({
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatCardModule],
})
export class LoginPageComponent {
  private router = inject(Router);
  private auth = getAuth();

  public login() {
    signInWithPopup(this.auth, new GoogleAuthProvider())
      .then(() => this.router.navigate(['admin']))
      .catch((error) => console.error(error));
  }
}
