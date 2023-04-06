import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { ThemingService } from '../../theming.service';

@Component({
  selector: 'osef-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    RouterLink,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    AsyncPipe
  ],
})
export class AdminHeaderComponent {

  public applicationTitle = 'Osefdetalife';

  constructor(private router: Router,
    private auth: Auth,
    private themingService: ThemingService) {
  }

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
