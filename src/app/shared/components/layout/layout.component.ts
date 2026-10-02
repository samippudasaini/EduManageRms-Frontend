import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule,
    MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule, MatButtonModule
    , MatMenuModule ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
  collegeName = 'School Management System';
  collegeLogo = '';
  defaultLogo = 'assets/img/college-logo-placeholder.svg';

  // Below this width the sidebar becomes an overlay drawer instead of
  // permanently pushing the content aside — otherwise Material still
  // reserves its width in the layout even while visually hidden.
  isMobile = false;

  constructor(
    public authService: AuthService,
    private api: ApiService,
    private breakpointObserver: BreakpointObserver
  ) {}

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

    // Tablet and phone widths both get the overlay drawer; anything wider
    // keeps the classic fixed sidebar.
    this.breakpointObserver
      .observe(['(max-width: 1024px)'])
      .subscribe(result => { this.isMobile = result.matches; });
  }

  /** Closes the overlay drawer after navigating, on mobile only. */
  closeOnMobileNav(sidenav: MatSidenav) {
    if (this.isMobile) sidenav.close();
  }

  get logoSrc(): string {
    return this.collegeLogo || this.defaultLogo;
  }
}