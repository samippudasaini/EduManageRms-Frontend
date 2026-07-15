import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../core/services/api.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-results-entry',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatButtonModule,
    MatIconModule, MatSnackBarModule, MatTooltipModule, MatProgressSpinnerModule],
  templateUrl: './results-entry.component.html',
  styleUrl: './results-entry.component.scss'
})
export class ResultsEntryComponent implements OnInit {
  examId!: number;
  fdId!: number;
  exam: any = null;
  results: any[] = [];
  uniqueSubjects: any[] = [];
  loading = false;
  saving = false;
  savingIndividual = false;
  uploadProgress = false;
  profile: any = null;
  editingResult: any = null;

  constructor(private route: ActivatedRoute, private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit() {
    this.examId = +this.route.snapshot.params['examId'];
    this.fdId   = +this.route.snapshot.params['fdId'];
    this.api.get<any>('profile').subscribe({ next: d => this.profile = d, error: () => {} });
    this.load();
  }

  load() {
    this.loading = true;
    this.results = [];
    this.uniqueSubjects = [];
    this.api.get<any[]>(`examinations/${this.examId}/results/${this.fdId}`).subscribe({
      next: data => {
        this.results = data;
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
      error: () => {
        this.loading = false;
        this.snack.open('Could not load results', '', { duration: 2000 });
      }
    });
    this.api.get<any>(`examinations/${this.examId}`).subscribe({
      next: d => this.exam = d,
      error: () => {}
    });
  }

  // ── Table helpers ──────────────────────────────────────────────────────────

  getMark(r: any, name: string): any {
    return r.marks?.find((x: any) => x.subjectName === name) ?? { theory: 0, practical: 0 };
  }

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

  // ── Save all ───────────────────────────────────────────────────────────────

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
      next: () => {
        this.saving = false;
        this.snack.open('All marks saved!', '', { duration: 2000 });
        this.load();
      },
      error: () => {
        this.saving = false;
        this.snack.open('Save failed', '', { duration: 2000 });
      }
    });
  }

  // ── Individual edit modal ──────────────────────────────────────────────────

  openEdit(result: any) {
    this.editingResult = JSON.parse(JSON.stringify(result));
  }

  closeEdit() { this.editingResult = null; }

  isSubjectFail(m: any): boolean {
    return m.passMarks != null && ((m.theory ?? 0) + (m.practical ?? 0)) < m.passMarks;
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
      error: () => {
        this.savingIndividual = false;
        this.snack.open('Save failed', '', { duration: 2000 });
      }
    });
  }

  // ── Excel template download ────────────────────────────────────────────────

  downloadTemplate() {
    const token = JSON.parse(localStorage.getItem('rms_user') || '{}').token || '';
    fetch(`${environment.apiUrl}/results/excel-template?examId=${this.examId}&fdId=${this.fdId}`,
      { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `marks_exam${this.examId}.xlsx`;
        a.click();
      })
      .catch(() => this.snack.open('Download failed', '', { duration: 2000 }));
  }

  // ── Excel upload ───────────────────────────────────────────────────────────

  onExcelUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploadProgress = true;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('examId', String(this.examId));
    fd.append('fdId', String(this.fdId));

    const token = JSON.parse(localStorage.getItem('rms_user') || '{}').token || '';

    fetch(`${environment.apiUrl}/results/bulk-upload-excel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    })
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((r: any) => {
      this.uploadProgress = false;
      this.snack.open(`✓ ${r.studentsUpdated ?? 0} student(s) updated from Excel`, '', { duration: 3000 });
      input.value = '';
      this.load();
    })
    .catch(err => {
      this.uploadProgress = false;
      this.snack.open('Upload failed: ' + err.message, '', { duration: 3000 });
    });
  }

  // ── Print ──────────────────────────────────────────────────────────────────

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
      ? `<img src="${p.logoUrl}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid #1a237e;">`
      : `<div style="width:80px;height:80px;border-radius:50%;background:#1a237e;display:flex;align-items:center;justify-content:center;color:#fff;font-size:32px;font-weight:bold;">${(p?.name || 'S').charAt(0)}</div>`;

    const sheets = marksheets.map(ms => {
      const rows = (ms.marks || []).map((m: any) => `
        <tr class="${m.pass ? '' : 'fail-row'}">
          <td style="text-align:left;padding-left:8px">${m.subjectName}</td>
          <td>${(m.theoryMax ?? 0) > 0 ? m.theoryMax : '-'}</td>
          <td>${(m.practicalMax ?? 0) > 0 ? m.practicalMax : '-'}</td>
          <td>${m.fullMarks}</td>
          <td>${m.passMarks ?? '-'}</td>
          <td>${(m.theoryMax ?? 0) > 0 ? (m.theory ?? 0) : '-'}</td>
          <td>${(m.practicalMax ?? 0) > 0 ? (m.practical ?? 0) : '-'}</td>
          <td><strong>${m.obtained ?? 0}</strong></td>
          <td class="${m.pass ? 'pass' : 'fail'}">${m.pass ? 'PASS' : 'FAIL'}</td>
        </tr>`).join('');

      return `
        <div class="marksheet">
          <div class="ms-header">
            <div class="logo-wrap">${logoHtml}</div>
            <div class="ms-college">
              <h2>${p?.name || 'School Management System'}</h2>
              <p>${p?.address || ''}</p>
              <p>${[p?.email, p?.phone].filter(Boolean).join(' | ')}</p>
            </div>
          </div>
          <div class="ms-title">
            <h3>MARK SHEET</h3>
            <p>${ms.examination?.name} — ${ms.examination?.year}</p>
          </div>
          <div class="ms-divider"></div>
          <table class="info-table">
            <tr>
              <td><b>Student Name:</b></td><td>${ms.student?.name}</td>
              <td><b>Program:</b></td><td>${ms.program?.name}</td>
            </tr>
            <tr>
              <td><b>Address:</b></td><td>${ms.student?.address ?? '-'}</td>
              <td><b>Guardian:</b></td><td>${ms.student?.guardianName ?? '-'}</td>
            </tr>
          </table>
          <table class="marks-table">
            <thead>
              <tr>
                <th style="text-align:left;padding-left:8px">Subject</th>
                <th>T.Max</th><th>P.Max</th><th>Full</th><th>Pass</th>
                <th>Theory</th><th>Practical</th><th>Total</th><th>Status</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>
              <tr>
                <td colspan="7" style="text-align:right"><b>Grand Total:</b></td>
                <td><b>${ms.totalObtained} / ${ms.totalMax}</b></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
          <div class="ms-summary">
            <div class="sum-item">
              <span class="sum-label">Percentage</span>
              <span class="sum-val">${(ms.percentage ?? 0).toFixed(2)}%</span>
            </div>
            <div class="sum-item">
              <span class="sum-label">Grade</span>
              <span class="sum-val">${ms.grade}</span>
            </div>
            <div class="sum-item">
              <span class="sum-label">Rank</span>
              <span class="sum-val">${ms.rank}</span>
            </div>
            <div class="sum-item">
              <span class="result-badge ${ms.grade === 'NG' || ms.grade === 'F' ? 'fail' : 'pass'}">
                ${ms.grade === 'NG' || ms.grade === 'F' ? 'FAIL' : 'PASS'}
              </span>
            </div>
          </div>
          <div class="ms-footer">
            <div class="sig-block"><div class="sig-line"></div><div>Class Teacher</div></div>
            <div class="sig-block"><div class="sig-line"></div><div>Examination Controller</div></div>
            <div class="sig-block"><div class="sig-line"></div><div>Principal</div></div>
          </div>
        </div>`;
    }).join('<div class="page-break"></div>');

    const w = window.open('', '_blank');
    if (w) {
      w.document.write(`<!DOCTYPE html><html><head>
        <meta charset="UTF-8"><title>Marksheet</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; color: #222; }
          .marksheet { padding: 28px 36px; max-width: 900px; margin: 0 auto; }
          .ms-header { display: flex; align-items: center; gap: 20px; margin-bottom: 10px; }
          .logo-wrap { flex-shrink: 0; }
          .ms-college h2 { margin: 0 0 4px; font-size: 22px; color: #1a237e; }
          .ms-college p { margin: 2px 0; font-size: 12px; color: #555; }
          .ms-title { text-align: center; margin: 8px 0; }
          .ms-title h3 { margin: 0; font-size: 16px; color: #1a237e; letter-spacing: 2px; }
          .ms-title p { margin: 2px 0; font-size: 13px; color: #444; }
          .ms-divider { border: none; border-top: 2px solid #1a237e; margin: 10px 0; }
          .info-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
          .info-table td { padding: 4px 8px; font-size: 12px; }
          .marks-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
          .marks-table th { background: #1a237e; color: #fff; padding: 7px 6px; font-size: 11px; text-align: center; }
          .marks-table td { padding: 6px; border-bottom: 1px solid #e0e0e0; text-align: center; font-size: 12px; }
          .marks-table tfoot td { background: #f5f5f5; font-weight: bold; border-top: 2px solid #1a237e; }
          .fail-row { background: #fff3f3; }
          .pass { color: #2e7d32; font-weight: bold; }
          .fail { color: #c62828; font-weight: bold; }
          .ms-summary { display: flex; gap: 20px; align-items: center; padding: 12px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; margin-bottom: 30px; }
          .sum-item { display: flex; flex-direction: column; }
          .sum-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
          .sum-val { font-size: 18px; font-weight: bold; color: #1a237e; }
          .result-badge { padding: 6px 18px; border-radius: 4px; font-weight: bold; font-size: 15px; margin-left: auto; }
          .result-badge.pass { background: #e8f5e9; color: #2e7d32; border: 2px solid #2e7d32; }
          .result-badge.fail { background: #ffebee; color: #c62828; border: 2px solid #c62828; }
          .ms-footer { display: flex; justify-content: space-between; margin-top: 40px; }
          .sig-block { text-align: center; font-size: 12px; }
          .sig-line { border-top: 1px solid #333; width: 130px; margin: 0 auto 6px; }
          .page-break { page-break-after: always; height: 0; }
          @media print { body { margin: 0; } .page-break { page-break-after: always; } }
        </style>
      </head><body>
        ${sheets}
        <script>window.onload = () => { window.print(); }<\/script>
      </body></html>`);
      w.document.close();
    }
  }
}