import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { ThemingService } from '../../theming.service';

@Component({
  selector: 'osef-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    RouterLink,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    AsyncPipe,
  ],
})
export class AdminHeaderComponent {
  private router = inject(Router);
  private themingService = inject(ThemingService);

  private auth = inject(Auth);
  public applicationTitle = 'Osefdetalife';

  public logout() {
    signOut(this.auth);
    this.router.navigate(['login']);
  }

  get theme$() {
    return this.themingService.theme$;
  }

  switchTheme() {
    this.themingService.switch();
  }
}
