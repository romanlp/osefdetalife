import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { signInWithPopup, Auth, GoogleAuthProvider } from '@angular/fire/auth';
import { Router, RouterModule } from '@angular/router';

@Component({
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: []
})
export class LoginPageComponent {

  constructor(private router: Router, private auth: Auth,) {
  }

  public login() {
    signInWithPopup(this.auth, new GoogleAuthProvider())
      .then(() => this.router.navigate(['admin']))
      .catch(error => console.error(error));
  }
}
