import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule,
    MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule, MatButtonModule, MatMenuModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
  collegeName = 'School Management System';
  collegeLogo = '';
  defaultLogo = 'assets/img/college-logo-placeholder.svg';

  constructor(public authService: AuthService, private api: ApiService) {}

  ngOnInit() {
    this.api.get<any>('profile').subscribe({
      next: d => {
        if (d) {
          this.collegeName = d.name || 'School Management System';
          this.collegeLogo = d.logoUrl || '';
        }
      },
      error: () => {}
    });
  }

  get logoSrc(): string {
    return this.collegeLogo || this.defaultLogo;
  }
}
