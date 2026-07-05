import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class LoginPageComponent {
  private router = inject(Router);
  private auth = inject(Auth);

  public login() {
    signInWithPopup(this.auth, new GoogleAuthProvider())
      .then(() => this.router.navigate(['admin']))
      .catch((error) => console.error(error));
  }
}
