import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { ThemingService } from '../../theming.service';

@Component({
  selector: 'osef-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss']
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

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule
  ],
  declarations: [AdminHeaderComponent],
  exports: [AdminHeaderComponent]
})
export class AdminHeaderModule {
}
