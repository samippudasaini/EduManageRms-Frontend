import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../core/services/api.service';
import { environment } from '../../../environments/environment';
import { buildMarksheetHtml } from './marksheet-template.component';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatButtonModule,
    MatIconModule, MatSnackBarModule, MatTooltipModule],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss'
})
export class ResultsComponent implements OnInit {
  examId!: number;
  fdId!: number;
  exam: any = null;
  results: any[] = [];
  uniqueSubjects: any[] = [];
  profile: any = null;
  loading = false;
  saving = false;
  uploadProgress = false;
  editingResult: any = null;
  savingIndividual = false;

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
          const seen = new Set<string>();
          this.uniqueSubjects = [];
          for (const m of (data[0].marks || [])) {
            if (!seen.has(m.subjectName)) {
              seen.add(m.subjectName);
              this.uniqueSubjects.push(m);
            }
          }
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snack.open('Could not load results', '', { duration: 2000 });
      }
    });
    this.api.get<any>(`examinations/${this.examId}`).subscribe({
      next: d => this.exam = d, error: () => {}
    });
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

  getMark(result: any, subjectName: string): any {
    return result.marks?.find((x: any) => x.subjectName === subjectName);
  }

  getTheory(result: any, name: string): number {
    return this.getMark(result, name)?.theory ?? 0;
  }

  getPractical(result: any, name: string): number {
    return this.getMark(result, name)?.practical ?? 0;
  }

  setTheory(result: any, name: string, value: any) {
    const m = this.getMark(result, name);
    if (m) m.theory = parseFloat(value) || 0;
  }

  setPractical(result: any, name: string, value: any) {
    const m = this.getMark(result, name);
    if (m) m.practical = parseFloat(value) || 0;
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
      next: () => {
        this.saving = false;
        this.snack.open('All marks saved!', '', { duration: 2500 });
        this.load();
      },
      error: () => {
        this.saving = false;
        this.snack.open('Save failed. Please try again.', '', { duration: 2500 });
      }
    });
  }

  openEdit(result: any) {
    this.editingResult = JSON.parse(JSON.stringify(result));
  }

  closeEdit() {
    this.editingResult = null;
  }

  isSubjectFail(m: any): boolean {
    const obtained = (m.theory ?? 0) + (m.practical ?? 0);
    return m.passMarks != null && obtained < m.passMarks;
  }

  anyTheory(): boolean {
    return this.editingResult?.marks?.some((m: any) => (m.theoryMax ?? 0) > 0) ?? false;
  }

  anyPractical(): boolean {
    return this.editingResult?.marks?.some((m: any) => (m.practicalMax ?? 0) > 0) ?? false;
  }

  saveIndividual() {
    if (!this.editingResult) return;
    this.savingIndividual = true;
    this.api.post('results/update', {
      resultId: this.editingResult.resultId,
      marks: this.editingResult.marks.map((m: any) => ({
        id: m.id,
        theory: m.theory ?? 0,
        practical: m.practical ?? 0
      }))
    }).subscribe({
      next: () => {
        this.savingIndividual = false;
        this.snack.open(`Saved for ${this.editingResult.studentName}`, '', { duration: 2000 });
        this.closeEdit();
        this.load();
      },
      error: () => {
        this.savingIndividual = false;
        this.snack.open('Save failed', '', { duration: 2000 });
      }
    });
  }

  downloadTemplate() {
    const token = this.getToken();
    fetch(`${environment.apiUrl}/results/excel-template?examId=${this.examId}&fdId=${this.fdId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => {
      if (!r.ok) throw new Error('Failed');
      return r.blob();
    }).then(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `marks_exam${this.examId}.xlsx`;
      a.click();
      URL.revokeObjectURL(a.href);
    }).catch(() => this.snack.open('Download failed', '', { duration: 2000 }));
  }

  onExcelUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploadProgress = true;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('examId', String(this.examId));
    fd.append('fdId', String(this.fdId));
    this.api.postForm('results/bulk-upload-excel', fd).subscribe({
      next: (res: any) => {
        this.uploadProgress = false;
        this.snack.open(`Excel uploaded: ${res.studentsUpdated} student(s) updated`, '', { duration: 3000 });
        input.value = '';
        this.load();
      },
      error: () => {
        this.uploadProgress = false;
        this.snack.open('Upload failed — check file format', '', { duration: 3000 });
        input.value = '';
      }
    });
  }

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
    const html: string = buildMarksheetHtml(marksheets, this.profile);
    const w = window.open('', '_blank');
    if (!w) {
      this.snack.open('Allow popups for this site to print', '', { duration: 3000 });
      return;
    }
    w.document.write(html);
    w.document.close();
  }

  private getToken(): string {
    try { return JSON.parse(localStorage.getItem('rms_user') || '{}').token || ''; }
    catch { return ''; }
  }
}

// function buildMarksheetHtml(marksheets: any[], profile: any): string {
//   throw new Error('Function not implemented.');
// }

