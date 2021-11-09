import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { signInWithPopup, Auth, GoogleAuthProvider } from '@angular/fire/auth';
import { Router, RouterModule } from '@angular/router';

@Component({
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: LoginPageComponent }]),
  ],
  declarations: [LoginPageComponent],
  exports: [LoginPageComponent]
})
export class LoginPageModule {
}
