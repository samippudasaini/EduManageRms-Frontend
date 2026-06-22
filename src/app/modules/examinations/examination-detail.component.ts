// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ActivatedRoute, RouterLink } from '@angular/router';
// import { MatCardModule } from '@angular/material/card';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatSelectModule } from '@angular/material/select';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatChipsModule } from '@angular/material/chips';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// import { ApiService } from '../../core/services/api.service';

// @Component({
//   selector: 'app-examination-detail',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule,
//     MatSelectModule, MatFormFieldModule, MatChipsModule, MatSnackBarModule],
//   templateUrl: './examination-detail.component.html',
//   styleUrl: './examination-detail.component.scss'
// })
// export class ExaminationDetailComponent implements OnInit {
//   exam: any = null; allPrograms: any[] = []; selectedFdId: any = null;
//   constructor(private route: ActivatedRoute, private api: ApiService, private snack: MatSnackBar) {}
//   ngOnInit() {
//     this.api.get<any[]>('faculty-details').subscribe(d => this.allPrograms = d);
//     this.load();
//   }
//   load() { this.api.get<any>(`examinations/${this.route.snapshot.params['id']}`).subscribe(d => this.exam = d); }
//   assignFd() {
//     if (!this.selectedFdId) { this.snack.open('Select a program','',{duration:2000}); return; }
//     this.api.post(`examinations/${this.exam.id}/faculty-details`, { facultyDetailId: this.selectedFdId }).subscribe({
//       next: () => { this.snack.open('Program assigned! Results created for all students.','',{duration:3000}); this.selectedFdId=null; this.load(); },
//       error: () => this.snack.open('Error','',{duration:2000})
//     });
//   }
//   removeFd(fdId: any) {
//     if (!confirm('Remove this program from exam?')) return;
//     this.api.delete(`examinations/${this.exam.id}/faculty-details/${fdId}`).subscribe({ next: () => { this.snack.open('Removed','',{duration:2000}); this.load(); } });
//   }
// }


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-examination-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatInputModule, MatFormFieldModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './examination-detail.component.html',
  styleUrl: './examination-detail.component.scss'
})
export class ExaminationDetailComponent implements OnInit {
  examId!: number;
  fdId!: number;
  exam: any = null;
  results: any[] = [];
  subjects: any[] = [];
  loading = false;
  saving = false;
  uploadProgress = false;
  profile: any = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.examId = +this.route.snapshot.params['examId'];
    this.fdId = +this.route.snapshot.params['fdId'];
    this.api.get<any>('profile').subscribe({ next: d => this.profile = d, error: () => {} });
    this.load();
  }

  load() {
    this.loading = true;
    this.api.get<any[]>(`examinations/${this.examId}/results/${this.fdId}`).subscribe({
      next: data => {
        this.results = data;
        if (data.length > 0) {
          this.subjects = data[0].marks || [];
        }
        this.loading = false;
      },
      error: () => { this.loading = false; this.snack.open('Could not load results', '', { duration: 2000 }); }
    });
    this.api.get<any>(`examinations/${this.examId}`).subscribe({ next: d => this.exam = d, error: () => {} });
  }

  getTheory(result: any, subjectName: string): number {
    const m = result.marks?.find((x: any) => x.subjectName === subjectName);
    return m?.theory ?? 0;
  }

  getPractical(result: any, subjectName: string): number {
    const m = result.marks?.find((x: any) => x.subjectName === subjectName);
    return m?.practical ?? 0;
  }

  setTheory(result: any, subjectName: string, value: any) {
    const m = result.marks?.find((x: any) => x.subjectName === subjectName);
    if (m) m.theory = parseFloat(value) || 0;
  }

  setPractical(result: any, subjectName: string, value: any) {
    const m = result.marks?.find((x: any) => x.subjectName === subjectName);
    if (m) m.practical = parseFloat(value) || 0;
  }

  hasTheory(subjectName: string): boolean {
    if (!this.results.length) return true;
    const m = this.results[0].marks?.find((x: any) => x.subjectName === subjectName);
    return (m?.theoryMax ?? 0) > 0;
  }

  hasPractical(subjectName: string): boolean {
    if (!this.results.length) return false;
    const m = this.results[0].marks?.find((x: any) => x.subjectName === subjectName);
    return (m?.practicalMax ?? 0) > 0;
  }

  saveAll() {
    this.saving = true;
    const payload = {
      results: this.results.map(r => ({
        resultId: r.resultId,
        marks: r.marks.map((m: any) => ({
          id: m.id,
          theory: m.theory ?? 0,
          practical: m.practical ?? 0
        }))
      }))
    };
    this.api.post('results/bulk-update', payload).subscribe({
      next: () => { this.saving = false; this.snack.open('Marks saved!', '', { duration: 2000 }); this.load(); },
      error: () => { this.saving = false; this.snack.open('Save failed', '', { duration: 2000 }); }
    });
  }

  downloadTemplate() {
    const url = `http://localhost:8080/api/results/excel-template?examId=${this.examId}&fdId=${this.fdId}`;
    const token = localStorage.getItem('rms_user') ? JSON.parse(localStorage.getItem('rms_user')!).token : '';
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob()).then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'marks_template.xlsx';
        a.click();
      });
  }

  onExcelUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploadProgress = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('examId', String(this.examId));
    formData.append('fdId', String(this.fdId));
    this.api.postForm('results/bulk-upload-excel', formData).subscribe({
      next: (res: any) => {
        this.uploadProgress = false;
        this.snack.open(`Uploaded: ${res.studentsUpdated} students updated`, '', { duration: 3000 });
        this.load();
      },
      error: () => { this.uploadProgress = false; this.snack.open('Upload failed', '', { duration: 2000 }); }
    });
  }

  printMarksheet(result: any) {
    this.api.get<any>(`results/marksheet/${result.resultId}`).subscribe({
      next: data => this.openMarksheetWindow([data]),
      error: () => this.snack.open('Could not load marksheet', '', { duration: 2000 })
    });
  }

  printAll() {
    this.api.get<any[]>(`results/marksheets?examId=${this.examId}&fdId=${this.fdId}`).subscribe({
      next: data => this.openMarksheetWindow(data),
      error: () => this.snack.open('Could not load marksheets', '', { duration: 2000 })
    });
  }

  private openMarksheetWindow(marksheets: any[]) {
    const p = this.profile;
    const logoHtml = p?.logoUrl
      ? `<img src="${p.logoUrl}" style="width:70px;height:70px;border-radius:50%;object-fit:cover;">`
      : `<div style="width:70px;height:70px;border-radius:50%;background:#1e88e5;display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px;font-weight:bold;">${(p?.name || 'S').charAt(0)}</div>`;

    const sheets = marksheets.map(ms => {
      const subjectRows = (ms.marks || []).map((m: any) => `
        <tr class="${m.pass ? '' : 'fail-row'}">
          <td>${m.subjectName}</td>
          <td>${m.theoryMax ?? '-'}</td>
          <td>${m.practicalMax ?? '-'}</td>
          <td>${m.fullMarks}</td>
          <td>${m.passMarks ?? '-'}</td>
          <td>${m.theory ?? 0}</td>
          <td>${m.practical ?? 0}</td>
          <td><strong>${m.obtained ?? 0}</strong></td>
          <td>${m.grade}</td>
          <td>${m.gradePoint}</td>
          <td class="${m.pass ? 'pass' : 'fail'}">${m.pass ? 'PASS' : 'FAIL'}</td>
        </tr>`).join('');

      return `
        <div class="marksheet">
          <div class="ms-header">
            ${logoHtml}
            <div class="ms-college">
              <h2>${p?.name || 'School Management System'}</h2>
              <div>${p?.address || ''}</div>
              <div>${p?.email || ''} ${p?.phone ? '| ' + p.phone : ''}</div>
              <h3 class="exam-title">${ms.examination?.name} — ${ms.examination?.year}</h3>
            </div>
          </div>
          <div class="ms-divider"></div>
          <div class="ms-student">
            <table class="info-table">
              <tr><td><b>Student Name:</b></td><td>${ms.student?.name}</td><td><b>Program:</b></td><td>${ms.program?.name}</td></tr>
              <tr><td><b>Address:</b></td><td>${ms.student?.address ?? '-'}</td><td><b>Guardian:</b></td><td>${ms.student?.guardianName ?? '-'}</td></tr>
            </table>
          </div>
          <table class="marks-table">
            <thead>
              <tr>
                <th>Subject</th><th>T.Max</th><th>P.Max</th><th>F.Mark</th>
                <th>P.Mark</th><th>Theory</th><th>Practical</th><th>Total</th>
                <th>Grade</th><th>GP</th><th>Status</th>
              </tr>
            </thead>
            <tbody>${subjectRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="7" style="text-align:right;"><b>Total Obtained / Total Full Marks:</b></td>
                <td><b>${ms.totalObtained} / ${ms.totalMax}</b></td>
                <td><b>${ms.gpa}</b></td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table>
          <div class="ms-summary">
            <span><b>Percentage:</b> ${ms.percentage?.toFixed(2)}%</span>
            <span><b>Final Grade:</b> ${ms.grade}</span>
            <span><b>Rank:</b> ${ms.rank}</span>
            <span class="result-badge ${ms.grade === 'NG' ? 'fail' : 'pass'}">${ms.grade === 'NG' ? 'FAIL' : 'PASS'}</span>
          </div>
          <div class="ms-footer">
            <div class="sig-block"><div class="sig-line"></div><div>Class Teacher</div></div>
            <div class="sig-block"><div class="sig-line"></div><div>Principal</div></div>
            <div class="sig-block"><div class="sig-line"></div><div>Date: ___________</div></div>
          </div>
        </div>`;
    }).join('<div class="page-break"></div>');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Marksheet</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; }
      .marksheet { padding: 24px 32px; max-width: 900px; margin: 0 auto; }
      .ms-header { display: flex; align-items: center; gap: 18px; margin-bottom: 8px; }
      .ms-college h2 { margin: 0 0 2px; font-size: 20px; color: #1a237e; }
      .ms-college h3.exam-title { margin: 6px 0 0; font-size: 14px; color: #1e88e5; }
      .ms-college div { font-size: 12px; color: #555; }
      .ms-divider { border-bottom: 2px solid #1e88e5; margin: 10px 0; }
      .info-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
      .info-table td { padding: 3px 8px; font-size: 12px; }
      .marks-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
      .marks-table th { background: #1a237e; color: #fff; padding: 6px 8px; font-size: 11px; text-align: center; }
      .marks-table td { padding: 5px 8px; border-bottom: 1px solid #e0e0e0; text-align: center; }
      .marks-table tfoot td { background: #f5f5f5; font-weight: bold; padding: 6px 8px; }
      .fail-row { background: #fff3f3; }
      .pass { color: #2e7d32; font-weight: bold; }
      .fail { color: #c62828; font-weight: bold; }
      .ms-summary { display: flex; gap: 24px; align-items: center; margin: 12px 0; font-size: 13px; }
      .result-badge { padding: 4px 14px; border-radius: 4px; font-weight: bold; font-size: 14px; }
      .result-badge.pass { background: #e8f5e9; color: #2e7d32; }
      .result-badge.fail { background: #ffebee; color: #c62828; }
      .ms-footer { display: flex; justify-content: space-between; margin-top: 40px; }
      .sig-block { text-align: center; font-size: 12px; }
      .sig-line { border-top: 1px solid #333; width: 120px; margin: 0 auto 4px; }
      .page-break { page-break-after: always; }
      @media print {
        .page-break { page-break-after: always; }
        body { margin: 0; }
      }
    </style></head><body>${sheets}
    <script>window.onload = () => window.print();</script>
    </body></html>`;

    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  }
}