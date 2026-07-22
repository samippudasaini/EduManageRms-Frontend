import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.scss'
})
export class AttendanceComponent implements OnInit {
  sections: any[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<any[]>('attendance/sections').subscribe({
      next: d => { this.sections = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}