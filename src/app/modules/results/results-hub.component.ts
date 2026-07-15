import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { ApiService } from 'src/app/core/services/api.service';

@Component({
  selector: 'app-results-hub',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatExpansionModule],
  templateUrl: './results-hub.component.html',
  styleUrl: './results-hub.component.scss'
})
export class ResultsHubComponent implements OnInit {
  examinations: any[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<any[]>('examinations').subscribe({
      next: exams => {
        this.examinations = exams.map(e => ({ ...e, programs: [], loaded: false }));
        if (!exams.length) { this.loading = false; return; }
        let done = 0;
        this.examinations.forEach((exam, i) => {
          this.api.get<any>(`examinations/${exam.id}`).subscribe({
            next: detail => {
              this.examinations[i].programs = detail.facultyDetails || [];
              this.examinations[i].loaded = true;
              if (++done === exams.length) this.loading = false;
            },
            error: () => { if (++done === exams.length) this.loading = false; }
          });
        });
      },
      error: () => { this.loading = false; }
    });
  }
}