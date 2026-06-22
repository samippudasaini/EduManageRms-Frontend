// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ActivatedRoute, RouterLink } from '@angular/router';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatTooltipModule } from '@angular/material/tooltip';
// import { ApiService } from 'src/app/core/services/api.service';

// @Component({
//   selector: 'app-results-entry',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterLink, MatButtonModule, MatIconModule,
//     MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule],
//   templateUrl: './results-entry.component.html',
//   styleUrl: './results-entry.component.scss'
// })
// export class ResultsEntryComponent implements OnInit {
//   examId!: number;
//   fdId!: number;
//   exam: any = null;
//   results: any[] = [];
//   subjects: any[] = [];
//   loading = false;
//   saving = false;
//   uploadProgress = false;
//   profile: any = null;

//   constructor(private route: ActivatedRoute, private api: ApiService, private snack: MatSnackBar) {}

//   ngOnInit() {
//     this.examId = +this.route.snapshot.params['examId'];
//     this.fdId = +this.route.snapshot.params['fdId'];
//     this.api.get<any>('profile').subscribe({ next: d => this.profile = d, error: () => {} });
//     this.load();
//   }

//   load() {
//     this.loading = true;
//     this.api.get<any[]>(`examinations/${this.examId}/results/${this.fdId}`).subscribe({
//       next: data => {
//         this.results = data;
//         if (data.length > 0) this.subjects = data[0].marks || [];
//         this.loading = false;
//       },
//       error: () => { this.loading = false; this.snack.open('Could not load results', '', { duration: 2000 }); }
//     });
//     this.api.get<any>(`examinations/${this.examId}`).subscribe({ next: d => this.exam = d, error: () => {} });
//   }

//   getTheory(r: any, name: string) { return r.marks?.find((x: any) => x.subjectName === name)?.theory ?? 0; }
//   getPractical(r: any, name: string) { return r.marks?.find((x: any) => x.subjectName === name)?.practical ?? 0; }
//   setTheory(r: any, name: string, v: any) { const m = r.marks?.find((x: any) => x.subjectName === name); if (m) m.theory = parseFloat(v) || 0; }
//   setPractical(r: any, name: string, v: any) { const m = r.marks?.find((x: any) => x.subjectName === name); if (m) m.practical = parseFloat(v) || 0; }
//   hasTheory(name: string) { if (!this.results.length) return true; return (this.results[0].marks?.find((x: any) => x.subjectName === name)?.theoryMax ?? 0) > 0; }
//   hasPractical(name: string) { if (!this.results.length) return false; return (this.results[0].marks?.find((x: any) => x.subjectName === name)?.practicalMax ?? 0) > 0; }

//   saveAll() {
//     this.saving = true;
//     this.api.post('results/bulk-update', {
//       results: this.results.map(r => ({
//         resultId: r.resultId,
//         marks: r.marks.map((m: any) => ({ id: m.id, theory: m.theory ?? 0, practical: m.practical ?? 0 }))
//       }))
//     }).subscribe({
//       next: () => { this.saving = false; this.snack.open('Marks saved!', '', { duration: 2000 }); this.load(); },
//       error: () => { this.saving = false; this.snack.open('Save failed', '', { duration: 2000 }); }
//     });
//   }

//   downloadTemplate() {
//     const token = JSON.parse(localStorage.getItem('rms_user') || '{}').token || '';
//     fetch(`http://localhost:8080/api/results/excel-template?examId=${this.examId}&fdId=${this.fdId}`,
//       { headers: { Authorization: `Bearer ${token}` } })
//       .then(r => r.blob()).then(blob => {
//         const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
//         a.download = 'marks_template.xlsx'; a.click();
//       });
//   }

//   onExcelUpload(event: Event) {
//     const file = (event.target as HTMLInputElement).files?.[0];
//     if (!file) return;
//     this.uploadProgress = true;
//     const fd = new FormData();
//     fd.append('file', file); fd.append('examId', String(this.examId)); fd.append('fdId', String(this.fdId));
//     this.api.postForm('results/bulk-upload-excel', fd).subscribe({
//       next: (r: any) => { this.uploadProgress = false; this.snack.open(`${r.studentsUpdated} students updated`, '', { duration: 3000 }); this.load(); },
//       error: () => { this.uploadProgress = false; this.snack.open('Upload failed', '', { duration: 2000 }); }
//     });
//   }

//   printMarksheet(result: any) {
//     this.api.get<any>(`results/marksheet/${result.resultId}`).subscribe({
//       next: data => this.openPrint([data]),
//       error: () => this.snack.open('Could not load marksheet', '', { duration: 2000 })
//     });
//   }

//   printAll() {
//     this.api.get<any[]>(`results/marksheets?examId=${this.examId}&fdId=${this.fdId}`).subscribe({
//       next: data => this.openPrint(data),
//       error: () => this.snack.open('Could not load marksheets', '', { duration: 2000 })
//     });
//   }

//   private openPrint(marksheets: any[]) {
//     const p = this.profile;
//     const logoHtml = p?.logoUrl
//       ? `<img src="${p.logoUrl}" style="width:70px;height:70px;border-radius:50%;object-fit:cover;">`
//       : `<div style="width:70px;height:70px;border-radius:50%;background:#1e88e5;display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px;font-weight:bold;">${(p?.name || 'S').charAt(0)}</div>`;

//     const sheets = marksheets.map(ms => {
//       const rows = (ms.marks || []).map((m: any) => `
//         <tr class="${m.pass ? '' : 'fail-row'}">
//           <td>${m.subjectName}</td><td>${m.theoryMax ?? '-'}</td><td>${m.practicalMax ?? '-'}</td>
//           <td>${m.fullMarks}</td><td>${m.passMarks ?? '-'}</td><td>${m.theory ?? 0}</td>
//           <td>${m.practical ?? 0}</td><td><strong>${m.obtained ?? 0}</strong></td>
//           <td>${m.grade}</td><td>${m.gradePoint}</td>
//           <td class="${m.pass ? 'pass' : 'fail'}">${m.pass ? 'PASS' : 'FAIL'}</td>
//         </tr>`).join('');
//       return `<div class="marksheet">
//         <div class="ms-header">${logoHtml}
//           <div class="ms-college">
//             <h2>${p?.name || 'School Management System'}</h2>
//             <div>${p?.address || ''}</div><div>${p?.email || ''} ${p?.phone ? '| ' + p.phone : ''}</div>
//             <h3 class="exam-title">${ms.examination?.name} — ${ms.examination?.year}</h3>
//           </div></div>
//         <div class="ms-divider"></div>
//         <table class="info-table"><tr>
//           <td><b>Student Name:</b></td><td>${ms.student?.name}</td>
//           <td><b>Program:</b></td><td>${ms.program?.name}</td></tr><tr>
//           <td><b>Address:</b></td><td>${ms.student?.address ?? '-'}</td>
//           <td><b>Guardian:</b></td><td>${ms.student?.guardianName ?? '-'}</td></tr>
//         </table>
//         <table class="marks-table"><thead><tr>
//           <th>Subject</th><th>T.Max</th><th>P.Max</th><th>Full</th><th>Pass</th>
//           <th>Theory</th><th>Practical</th><th>Total</th><th>Grade</th><th>GP</th><th>Status</th>
//         </tr></thead><tbody>${rows}</tbody>
//         <tfoot><tr><td colspan="7" style="text-align:right"><b>Total:</b></td>
//           <td><b>${ms.totalObtained} / ${ms.totalMax}</b></td><td><b>${ms.gpa}</b></td><td colspan="2"></td>
//         </tr></tfoot></table>
//         <div class="ms-summary">
//           <span><b>Percentage:</b> ${ms.percentage?.toFixed(2)}%</span>
//           <span><b>Grade:</b> ${ms.grade}</span><span><b>Rank:</b> ${ms.rank}</span>
//           <span class="result-badge ${ms.grade === 'NG' ? 'fail' : 'pass'}">${ms.grade === 'NG' ? 'FAIL' : 'PASS'}</span>
//         </div>
//         <div class="ms-footer">
//           <div class="sig-block"><div class="sig-line"></div><div>Class Teacher</div></div>
//           <div class="sig-block"><div class="sig-line"></div><div>Principal</div></div>
//           <div class="sig-block"><div class="sig-line"></div><div>Date: ___________</div></div>
//         </div></div>`;
//     }).join('<div class="page-break"></div>');

//     const w = window.open('', '_blank');
//     if (w) { w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Marksheet</title>
//     <style>body{font-family:Arial,sans-serif;font-size:12px;margin:0}.marksheet{padding:24px 32px;max-width:900px;margin:0 auto}
//     .ms-header{display:flex;align-items:center;gap:18px;margin-bottom:8px}.ms-college h2{margin:0 0 2px;font-size:20px;color:#1a237e}
//     .ms-college h3.exam-title{margin:6px 0 0;font-size:14px;color:#1e88e5}.ms-college div{font-size:12px;color:#555}
//     .ms-divider{border-bottom:2px solid #1e88e5;margin:10px 0}.info-table{width:100%;border-collapse:collapse;margin-bottom:12px}
//     .info-table td{padding:3px 8px;font-size:12px}.marks-table{width:100%;border-collapse:collapse;margin-bottom:12px}
//     .marks-table th{background:#1a237e;color:#fff;padding:6px 8px;font-size:11px;text-align:center}
//     .marks-table td{padding:5px 8px;border-bottom:1px solid #e0e0e0;text-align:center}
//     .marks-table tfoot td{background:#f5f5f5;font-weight:bold;padding:6px 8px}.fail-row{background:#fff3f3}
//     .pass{color:#2e7d32;font-weight:bold}.fail{color:#c62828;font-weight:bold}
//     .ms-summary{display:flex;gap:24px;align-items:center;margin:12px 0;font-size:13px}
//     .result-badge{padding:4px 14px;border-radius:4px;font-weight:bold;font-size:14px}
//     .result-badge.pass{background:#e8f5e9;color:#2e7d32}.result-badge.fail{background:#ffebee;color:#c62828}
//     .ms-footer{display:flex;justify-content:space-between;margin-top:40px}
//     .sig-block{text-align:center;font-size:12px}.sig-line{border-top:1px solid #333;width:120px;margin:0 auto 4px}
//     .page-break{page-break-after:always}@media print{.page-break{page-break-after:always}body{margin:0}}</style>
//     </head><body>${sheets}<script>window.onload=()=>window.print();</script></body></html>`);
//       w.document.close();
//     }
//   }
// }


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-results-entry',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatButtonModule,
    MatIconModule, MatSnackBarModule, MatTooltipModule],
  templateUrl: './results-entry.component.html',
  styleUrl: './results-entry.component.scss'
})
export class ResultsEntryComponent implements OnInit {
  examId!: number;
  fdId!: number;
  exam: any = null;
  results: any[] = [];
  uniqueSubjects: any[] = [];   // deduplicated subjects for table headers
  loading = false;
  saving = false;
  savingIndividual = false;
  uploadProgress = false;
  profile: any = null;
  editingResult: any = null;    // currently open in the individual edit modal

  constructor(private route: ActivatedRoute, private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit() {
    this.examId = +this.route.snapshot.params['examId'];
    this.fdId   = +this.route.snapshot.params['fdId'];
    this.api.get<any>('profile').subscribe({ next: d => this.profile = d, error: () => {} });
    this.load();
  }

  load() {
    this.loading = true;
    this.api.get<any[]>(`examinations/${this.examId}/results/${this.fdId}`).subscribe({
      next: data => {
        this.results = data;
        // Build unique subjects list from first student's marks (deduplicated by name)
        if (data.length > 0) {
          const seen = new Set<string>();
          this.uniqueSubjects = (data[0].marks || []).filter((m: any) => {
            if (seen.has(m.subjectName)) return false;
            seen.add(m.subjectName);
            return true;
          });
        }
        this.loading = false;
      },
      error: () => { this.loading = false; this.snack.open('Could not load results', '', { duration: 2000 }); }
    });
    this.api.get<any>(`examinations/${this.examId}`).subscribe({ next: d => this.exam = d, error: () => {} });
  }

  // ─── Table helpers ─────────────────────────────────────────────────────────

  hasTheory(name: string): boolean {
    if (!this.results.length) return false;
    return (this.results[0].marks?.find((x: any) => x.subjectName === name)?.theoryMax ?? 0) > 0;
  }

  hasPractical(name: string): boolean {
    if (!this.results.length) return false;
    return (this.results[0].marks?.find((x: any) => x.subjectName === name)?.practicalMax ?? 0) > 0;
  }

  subjectColspan(name: string): number {
    return (this.hasTheory(name) ? 1 : 0) + (this.hasPractical(name) ? 1 : 0);
  }

  getTheory(r: any, name: string): number {
    return r.marks?.find((x: any) => x.subjectName === name)?.theory ?? 0;
  }

  getPractical(r: any, name: string): number {
    return r.marks?.find((x: any) => x.subjectName === name)?.practical ?? 0;
  }

  setTheory(r: any, name: string, value: any) {
    const m = r.marks?.find((x: any) => x.subjectName === name);
    if (m) m.theory = parseFloat(value) || 0;
  }

  setPractical(r: any, name: string, value: any) {
    const m = r.marks?.find((x: any) => x.subjectName === name);
    if (m) m.practical = parseFloat(value) || 0;
  }

  // ─── Save all (bulk) ───────────────────────────────────────────────────────

  saveAll() {
    this.saving = true;
    const payload = {
      results: this.results.map(r => ({
        resultId: r.resultId,
        marks: r.marks.map((m: any) => ({ id: m.id, theory: m.theory ?? 0, practical: m.practical ?? 0 }))
      }))
    };
    this.api.post('results/bulk-update', payload).subscribe({
      next: () => { this.saving = false; this.snack.open('All marks saved!', '', { duration: 2000 }); this.load(); },
      error: () => { this.saving = false; this.snack.open('Save failed', '', { duration: 2000 }); }
    });
  }

  // ─── Individual student edit modal ────────────────────────────────────────

  openEdit(result: any) {
    // Deep-clone so edits don't affect the table until saved
    this.editingResult = JSON.parse(JSON.stringify(result));
  }

  closeEdit() { this.editingResult = null; }

  recalcObtained(m: any) {
    // Live feedback — nothing to store, template computes (theory + practical)
  }

  isSubjectFail(m: any): boolean {
    const obtained = (m.theory ?? 0) + (m.practical ?? 0);
    return m.passMarks != null && obtained < m.passMarks;
  }

  anyTheory(): boolean {
    return this.editingResult?.marks?.some((m: any) => (m.theoryMax ?? 0) > 0);
  }

  anyPractical(): boolean {
    return this.editingResult?.marks?.some((m: any) => (m.practicalMax ?? 0) > 0);
  }

  saveIndividual() {
    this.savingIndividual = true;
    const payload = {
      resultId: this.editingResult.resultId,
      marks: this.editingResult.marks.map((m: any) => ({
        id: m.id,
        theory: m.theory ?? 0,
        practical: m.practical ?? 0
      }))
    };
    this.api.post('results/update', payload).subscribe({
      next: () => {
        this.savingIndividual = false;
        this.snack.open(`Marks saved for ${this.editingResult.studentName}`, '', { duration: 2000 });
        this.closeEdit();
        this.load();
      },
      error: () => { this.savingIndividual = false; this.snack.open('Save failed', '', { duration: 2000 }); }
    });
  }

  // ─── Excel ────────────────────────────────────────────────────────────────

  downloadTemplate() {
    const token = JSON.parse(localStorage.getItem('rms_user') || '{}').token || '';
    fetch(`http://localhost:8080/api/results/excel-template?examId=${this.examId}&fdId=${this.fdId}`,
      { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob()).then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'marks_template.xlsx';
        a.click();
      });
  }

  onExcelUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadProgress = true;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('examId', String(this.examId));
    fd.append('fdId', String(this.fdId));
    this.api.postForm('results/bulk-upload-excel', fd).subscribe({
      next: (r: any) => {
        this.uploadProgress = false;
        this.snack.open(`${r.studentsUpdated} students updated from Excel`, '', { duration: 3000 });
        this.load();
      },
      error: () => { this.uploadProgress = false; this.snack.open('Upload failed', '', { duration: 2000 }); }
    });
  }

  // ─── Print ────────────────────────────────────────────────────────────────

  printMarksheet(result: any) {
    this.api.get<any>(`results/marksheet/${result.resultId}`).subscribe({
      next: data => this.openPrint([data]),
      error: () => this.snack.open('Could not load marksheet', '', { duration: 2000 })
    });
  }

  printAll() {
    this.api.get<any[]>(`results/marksheets?examId=${this.examId}&fdId=${this.fdId}`).subscribe({
      next: data => this.openPrint(data),
      error: () => this.snack.open('Could not load marksheets', '', { duration: 2000 })
    });
  }

  private openPrint(marksheets: any[]) {
    const p = this.profile;
    const logoHtml = p?.logoUrl
      ? `<img src="${p.logoUrl}" style="width:70px;height:70px;border-radius:50%;object-fit:cover;">`
      : `<div style="width:70px;height:70px;border-radius:50%;background:#1e88e5;display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px;font-weight:bold;">${(p?.name || 'S').charAt(0)}</div>`;

    const sheets = marksheets.map(ms => {
      const rows = (ms.marks || []).map((m: any) => `
        <tr class="${m.pass ? '' : 'fail-row'}">
          <td>${m.subjectName}</td><td>${m.theoryMax ?? '-'}</td><td>${m.practicalMax ?? '-'}</td>
          <td>${m.fullMarks}</td><td>${m.passMarks ?? '-'}</td>
          <td>${m.theory ?? 0}</td><td>${m.practical ?? 0}</td>
          <td><strong>${m.obtained ?? 0}</strong></td>
          <td>${m.grade}</td><td>${m.gradePoint}</td>
          <td class="${m.pass ? 'pass' : 'fail'}">${m.pass ? 'PASS' : 'FAIL'}</td>
        </tr>`).join('');

      return `<div class="marksheet">
        <div class="ms-header">${logoHtml}
          <div class="ms-college">
            <h2>${p?.name || 'School Management System'}</h2>
            <div>${p?.address || ''}</div>
            <div>${p?.email || ''}${p?.phone ? ' | ' + p.phone : ''}</div>
            <h3 class="exam-title">${ms.examination?.name} — ${ms.examination?.year}</h3>
          </div>
        </div>
        <div class="ms-divider"></div>
        <table class="info-table">
          <tr><td><b>Student Name:</b></td><td>${ms.student?.name}</td><td><b>Program:</b></td><td>${ms.program?.name}</td></tr>
          <tr><td><b>Address:</b></td><td>${ms.student?.address ?? '-'}</td><td><b>Guardian:</b></td><td>${ms.student?.guardianName ?? '-'}</td></tr>
        </table>
        <table class="marks-table">
          <thead><tr>
            <th>Subject</th><th>T.Max</th><th>P.Max</th><th>Full</th><th>Pass</th>
            <th>Theory</th><th>Practical</th><th>Total</th><th>Grade</th><th>GP</th><th>Status</th>
          </tr></thead>
          <tbody>${rows}</tbody>
          <tfoot><tr>
            <td colspan="7" style="text-align:right"><b>Total:</b></td>
            <td><b>${ms.totalObtained} / ${ms.totalMax}</b></td>
            <td><b>${ms.gpa}</b></td><td colspan="2"></td>
          </tr></tfoot>
        </table>
        <div class="ms-summary">
          <span><b>Percentage:</b> ${ms.percentage?.toFixed(2)}%</span>
          <span><b>Grade:</b> ${ms.grade}</span>
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

    const w = window.open('', '_blank');
    if (w) {
      w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Marksheet</title>
      <style>
        body{font-family:Arial,sans-serif;font-size:12px;margin:0}
        .marksheet{padding:24px 32px;max-width:900px;margin:0 auto}
        .ms-header{display:flex;align-items:center;gap:18px;margin-bottom:8px}
        .ms-college h2{margin:0 0 2px;font-size:20px;color:#1a237e}
        .ms-college h3.exam-title{margin:6px 0 0;font-size:14px;color:#1e88e5}
        .ms-college div{font-size:12px;color:#555}
        .ms-divider{border-bottom:2px solid #1e88e5;margin:10px 0}
        .info-table{width:100%;border-collapse:collapse;margin-bottom:12px}
        .info-table td{padding:3px 8px;font-size:12px}
        .marks-table{width:100%;border-collapse:collapse;margin-bottom:12px}
        .marks-table th{background:#1a237e;color:#fff;padding:6px 8px;font-size:11px;text-align:center}
        .marks-table td{padding:5px 8px;border-bottom:1px solid #e0e0e0;text-align:center}
        .marks-table tfoot td{background:#f5f5f5;font-weight:bold;padding:6px 8px}
        .fail-row{background:#fff3f3}
        .pass{color:#2e7d32;font-weight:bold}.fail{color:#c62828;font-weight:bold}
        .ms-summary{display:flex;gap:24px;align-items:center;margin:12px 0;font-size:13px}
        .result-badge{padding:4px 14px;border-radius:4px;font-weight:bold;font-size:14px}
        .result-badge.pass{background:#e8f5e9;color:#2e7d32}
        .result-badge.fail{background:#ffebee;color:#c62828}
        .ms-footer{display:flex;justify-content:space-between;margin-top:40px}
        .sig-block{text-align:center;font-size:12px}
        .sig-line{border-top:1px solid #333;width:120px;margin:0 auto 4px}
        .page-break{page-break-after:always}
        @media print{.page-break{page-break-after:always}body{margin:0}}
      </style></head><body>${sheets}
      <script>window.onload=()=>window.print();</script>
      </body></html>`);
      w.document.close();
    }
  }
}