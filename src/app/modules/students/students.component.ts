import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../core/services/api.service';
import { environment } from '../../../environments/environment';
import { forkJoin } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule,
    MatSnackBarModule, MatExpansionModule, MatTooltipModule,MatDialogModule],
  templateUrl: './students.component.html',
  styleUrl: './students.component.scss'
})
export class StudentsComponent implements OnInit {

  viewMode: 'grouped' | 'list' = 'grouped';
  groups: any[] = [];
  students: any[] = [];
  searchTerm = '';
  searching = false;
  showForm = false;
  form: any = {
    name: '', address: '', guardianName: '', contact: '',
    email: '', facultyDetailsId: null, gradesId: null
  };
  editId: any = null;
  programs: any[] = [];
  gradeSections: any[] = [];
  uploadProgress = false;
  uploadResult: any = null;
  totalStudents = 0;
  duplicateError = '';   // shows inline duplicate warning on form

  constructor(private api: ApiService, private snack: MatSnackBar, private dialog: MatDialog) {}

  ngOnInit() {
    forkJoin({
      programs: this.api.get<any[]>('faculty-details'),
      gradeSections: this.api.get<any[]>('grade-sections')
    }).subscribe(r => {
      this.programs = r.programs;
      this.gradeSections = r.gradeSections;
    });
    this.loadGrouped();
  }

  loadGrouped() {
    this.api.get<any[]>('students/grouped').subscribe({
      next: data => {
        this.groups = data;
        this.totalStudents = data.reduce((s, g) => s + (g.totalCount || 0), 0);
      },
      error: () => this.snack.open('Could not load students', '', { duration: 2000 })
    });
  }

  loadList() {
    this.api.get<any[]>('students').subscribe(d => {
      this.students = d;
      this.totalStudents = d.length;
    });
  }

  setView(mode: 'grouped' | 'list') {
    this.viewMode = mode;
    this.searching = false;
    this.searchTerm = '';
    if (mode === 'list') this.loadList();
    else this.loadGrouped();
  }

  search() {
    if (!this.searchTerm.trim()) {
      this.searching = false;
      if (this.viewMode === 'grouped') this.loadGrouped();
      else this.loadList();
      return;
    }
    this.searching = true;
    this.viewMode = 'list';
    this.api.get<any[]>(`students/search?name=${encodeURIComponent(this.searchTerm)}`)
      .subscribe(d => this.students = d);
  }

  save() {
    if (!this.form.name.trim()) {
      this.snack.open('Student name is required', '', { duration: 2000 });
      return;
    }
    this.duplicateError = '';
    const obs = this.editId
      ? this.api.put(`students/${this.editId}`, this.form)
      : this.api.post('students', this.form);

    obs.subscribe({
      next: () => {
        this.snack.open(this.editId ? 'Student updated!' : 'Student added!', '', { duration: 2000 });
        this.resetForm();
        this.showForm = false;
        this.loadGrouped();
        this.viewMode = 'grouped';
      },
      error: (err) => {
        // HTTP 409 = duplicate detected by HashSet algorithm on backend
        if (err.status === 409) {
          this.duplicateError = err.error?.message || 'Duplicate student detected.';
        } else {
          this.snack.open('Error saving student', '', { duration: 2000 });
        }
      }
    });
  }

  edit(s: any) {
    this.editId = s.id;
    this.duplicateError = '';
    this.form = {
      name: s.name,
      address: s.address,
      guardianName: s.guardianName,
      contact: s.contact,
      email: s.email || '',
      facultyDetailsId: s.facultyDetailsId,
      gradesId: s.gradesId
    };
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

delete(studentOrId: any) {
  // Handle both delete(student) and delete(student.id) call patterns
  const student = typeof studentOrId === 'object'
    ? studentOrId
    : this.students.find(s => s.id === studentOrId)
      || { id: studentOrId, name: 'this student' };

  if (!student.id) {
    this.snack.open('Cannot delete: student ID is missing', '', { duration: 3000 });
    return;
  }

  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '420px',
    data: {
      title: 'Delete Student',
      studentName: student.name || 'this student',
      items: [
        'All examination results and marks',
        'All attendance records',
        'All assignment records',
        'All remarks'
      ]
    }
  });

  dialogRef.afterClosed().subscribe(confirmed => {
    if (!confirmed) return;
    this.api.delete(`students/${student.id}`).subscribe({
      next: () => {
        this.snack.open(`${student.name || 'Student'} deleted successfully`, '', { duration: 3000 });
        this.loadGrouped();
        if (this.viewMode === 'list') this.loadList();
      },
      error: (err) => {
        this.snack.open(
          'Delete failed: ' + (err?.error?.message || 'Please try again'),
          'Close', { duration: 5000 }
        );
      }
    });
  });
}

  resetForm() {
    this.editId = null;
    this.duplicateError = '';
    this.form = {
      name: '', address: '', guardianName: '', contact: '',
      email: '', facultyDetailsId: null, gradesId: null
    };
  }

  cancelForm() {
    this.resetForm();
    this.showForm = false;
  }

  downloadTemplate() {
    const token = this.getToken();
    fetch(`${environment.apiUrl}/students/excel-template`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => {
      if (!r.ok) throw new Error('Failed');
      return r.blob();
    }).then(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'students_template.xlsx';
      a.click();
      URL.revokeObjectURL(a.href);
    }).catch(() => this.snack.open('Download failed', '', { duration: 2000 }));
  }

  onExcelUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploadProgress = true;
    this.uploadResult = null;
    const fd = new FormData();
    fd.append('file', file);
    this.api.postForm('students/bulk-upload', fd).subscribe({
      next: (res: any) => {
        this.uploadProgress = false;
        this.uploadResult = res;
        this.snack.open(
          `${res.created} added, ${res.skippedDuplicate} duplicates skipped`,
          '', { duration: 4000 });
        input.value = '';
        this.loadGrouped();
        this.viewMode = 'grouped';
      },
      error: (err) => {
        this.uploadProgress = false;
        this.snack.open('Upload failed: ' + (err?.error?.message || 'Check file format'),
          '', { duration: 4000 });
        input.value = '';
      }
    });
  }

  private getToken(): string {
    try { return JSON.parse(localStorage.getItem('rms_user') || '{}').token || ''; }
    catch { return ''; }
  }
}
