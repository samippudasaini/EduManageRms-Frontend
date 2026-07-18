import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../core/services/api.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-assignment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatSnackBarModule, MatTooltipModule],
  templateUrl: './assignment-list.component.html',
  styleUrl: './assignment-list.component.scss'
})
export class AssignmentListComponent implements OnInit {
  gsId!: number;
  assignments: any[] = [];
  gradeName = '';
  sectionName = '';
  showForm = false;
  saving = false;
  form: any = {
    name: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
  };
  selectedFile: File | null = null;
  fileError = '';

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.gsId = +this.route.snapshot.params['gsId'];
    this.load();
  }

  load() {
    this.api.get<any[]>(`assignments/grade/${this.gsId}`).subscribe({
      next: data => {
        this.assignments = data;
        if (data.length > 0) {
          this.gradeName = data[0].gradeName;
          this.sectionName = data[0].sectionName;
        }
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.fileError = '';
    if (!file) { this.selectedFile = null; return; }

    // Validate: only PDF, images, text
    const allowed = ['application/pdf', 'text/plain', 'text/csv']
      .concat(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
    if (!allowed.includes(file.type) && !file.type.startsWith('image/')) {
      this.fileError = 'Only PDF, image (JPG/PNG), and text files are allowed.';
      this.selectedFile = null;
      input.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.fileError = 'File size must be under 10MB.';
      this.selectedFile = null;
      input.value = '';
      return;
    }
    this.selectedFile = file;
  }

  save() {
    if (!this.form.name.trim()) {
      this.snack.open('Assignment name is required', '', { duration: 2000 });
      return;
    }
    this.saving = true;
    const fd = new FormData();
    fd.append('name', this.form.name);
    fd.append('description', this.form.description || '');
    fd.append('date', this.form.date);
    fd.append('dueDate', this.form.dueDate || '');
    fd.append('gradesId', String(this.gsId));
    if (this.selectedFile) fd.append('file', this.selectedFile);

    this.api.postForm('assignments', fd).subscribe({
      next: () => {
        this.saving = false;
        this.snack.open('Assignment created!', '', { duration: 2000 });
        this.showForm = false;
        this.form = { name: '', description: '', date: new Date().toISOString().split('T')[0], dueDate: '' };
        this.selectedFile = null;
        this.load();
      },
      error: () => {
        this.saving = false;
        this.snack.open('Error creating assignment', '', { duration: 2000 });
      }
    });
  }

  deleteAssignment(id: any) {
    if (!confirm('Delete this assignment and all submissions?')) return;
    this.api.delete(`assignments/${id}`).subscribe({
      next: () => { this.snack.open('Deleted', '', { duration: 2000 }); this.load(); }
    });
  }

  openFile(a: any) {
    const token = this.getToken();
    window.open(`${environment.apiUrl}/assignments/${a.id}/file`, '_blank');
  }

  fileIcon(fileType: string): string {
    if (!fileType) return 'attach_file';
    if (fileType === 'application/pdf') return 'picture_as_pdf';
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('text/')) return 'description';
    return 'attach_file';
  }

  formatSize(bytes: number): string {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }

  private getToken(): string {
    try { return JSON.parse(localStorage.getItem('rms_user') || '{}').token || ''; }
    catch { return ''; }
  }
}