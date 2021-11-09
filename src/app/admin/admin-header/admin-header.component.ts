import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { signOut, Auth } from '@angular/fire/auth';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { ThemingService } from '../../theming.service';

@Component({
  selector: 'app-admin-header',
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

  switchTheme() {
    this.themingService.switch();
  }
}

@NgModule({
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule],
  declarations: [AdminHeaderComponent],
  exports: [AdminHeaderComponent]
})
export class AdminHeaderModule {
}
