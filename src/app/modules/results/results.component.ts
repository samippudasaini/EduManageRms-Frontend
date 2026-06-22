import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule, MatSnackBarModule, MatTableModule, MatTabsModule],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss'
})
export class ResultsComponent implements OnInit {
  results: any[] = [];
  examId: any; fdId: any;
  sheetCols = ['sn','name','grade','percentage','rank'];
  loading: boolean | undefined;
  examinations: any[] =[];

  constructor(private route: ActivatedRoute, private api: ApiService, private snack: MatSnackBar) {}

  // ngOnInit() {
  //   this.examId = this.route.snapshot.params['examId'];
  //   this.fdId = this.route.snapshot.params['fdId'];
  //   this.load();
  // }

  ngOnInit() {
    this.api.get<any[]>('examinations').subscribe({
      next: exams => {
        // For each exam, load its faculty details
        let loaded = 0;
        if (!exams.length) { this.loading = false; return; }
        this.examinations = exams.map(e => ({ ...e, programs: [], expanded: false }));
        this.examinations.forEach((exam, i) => {
          this.api.get<any>(`examinations/${exam.id}`).subscribe({
            next: detail => {
              this.examinations[i].programs = detail.facultyDetails || [];
              loaded++;
              if (loaded === exams.length) this.loading = false;
            },
            error: () => { loaded++; if (loaded === exams.length) this.loading = false; }
          });
        });
      },
      error: () => { this.loading = false; }
    });
  }

  load() { this.api.get<any[]>(`examinations/${this.examId}/results/${this.fdId}`).subscribe(d => this.results = d); }
  gradeClass(g: string): string {
    if (!g) return '';
    const map: any = {'A+':'grade-A-plus','A':'grade-A','B+':'grade-B-plus','B':'grade-B','C':'grade-C','D':'grade-D','F':'grade-F','NG':'grade-NG'};
    return map[g] || '';
  }
  calcTotal(result: any) {
    let total = 0, max = 0, fail = false;
    for (const m of result.marks) {
      const ob = (m.theory||0)+(m.practical||0);
      total += ob; max += m.fullMarks;
      if (ob < m.passMarks) fail = true;
    }
    const pct = max ? (total/max)*100 : 0;
    if (!fail) { result.percentage = pct; result.grade = this.calcGrade(pct); }
    else { result.grade = 'NG'; result.percentage = pct; }
  }
  calcGrade(pct: number): string {
    if (pct>=90) return 'A+'; if (pct>=80) return 'A'; if (pct>=70) return 'B+';
    if (pct>=60) return 'B'; if (pct>=50) return 'C'; if (pct>=40) return 'D'; return 'F';
  }
  saveMarks(result: any) {
    this.api.post('results/update', { resultId: result.resultId, marks: result.marks }).subscribe({
      next: () => { this.snack.open('Marks saved & ranked!','',{duration:2000}); this.load(); },
      error: () => this.snack.open('Error saving marks','',{duration:2000})
    });
  }
  print() { window.print(); }
}
