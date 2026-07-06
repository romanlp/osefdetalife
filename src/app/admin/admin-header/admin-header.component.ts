import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { getAuth, signOut } from 'firebase/auth';
import { ThemingService } from '../../theming.service';
@Component({
  selector: 'osef-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatToolbarModule, MatIconModule, MatButtonModule],
})
export class AdminHeaderComponent {
  private router = inject(Router);
  private auth = getAuth();
  private themingService = inject(ThemingService);

  public theme = this.themingService.currentTheme;

  public applicationTitle = 'Osefdetalife';

  public logout() {
    signOut(this.auth);
    this.router.navigate(['login']);
  }

  switchTheme() {
    this.themingService.switch();
  }
}
