import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  stats = { students: 0, faculties: 0, subjects: 0, examinations: 0 };
  profile: any = null;
  defaultLogo = 'assets/img/college-logo-placeholder.svg';

  constructor(public authService: AuthService, private api: ApiService) {}
  ngOnInit() {
    forkJoin({
      students: this.api.get<any[]>('students'),
      faculties: this.api.get<any[]>('faculties'),
      subjects: this.api.get<any[]>('subjects'),
      examinations: this.api.get<any[]>('examinations')
    }).subscribe({ next: r => { this.stats.students = r.students.length; this.stats.faculties = r.faculties.length; this.stats.subjects = r.subjects.length; this.stats.examinations = r.examinations.length; }, error: () => {} });

    this.api.get<any>('profile').subscribe({
      next: d => this.profile = d,
      error: () => {}
    });
  }

  get logoSrc(): string {
    return this.profile?.logoUrl || this.defaultLogo;
  }
}
