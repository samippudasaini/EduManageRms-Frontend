import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../core/services/api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule, MatSnackBarModule],
  templateUrl: './students.component.html',
  styleUrl: './students.component.scss'
})
export class StudentsComponent implements OnInit {
  students: any[] = []; programs: any[] = []; gradeSections: any[] = [];
  form: any = { name:'', address:'', guardianName:'', contact:'', facultyDetailsId:null, gradesId:null };
  editId: any = null; searchTerm = '';
  cols = ['id','name','guardian','contact','program','grade','actions'];
  constructor(private api: ApiService, private snack: MatSnackBar) {}
  ngOnInit() {
    forkJoin({ programs: this.api.get<any[]>('faculty-details'), gradeSections: this.api.get<any[]>('grade-sections') })
      .subscribe(r => { this.programs = r.programs; this.gradeSections = r.gradeSections; });
    this.load();
  }
  load() { this.api.get<any[]>('students').subscribe(d => this.students = d); }
  search() {
    if (this.searchTerm.trim()) this.api.get<any[]>(`students/search?name=${this.searchTerm}`).subscribe(d => this.students = d);
    else this.load();
  }
  save() {
    if (!this.form.name.trim()) { this.snack.open('Enter student name','',{duration:2000}); return; }
    const obs = this.editId ? this.api.put(`students/${this.editId}`, this.form) : this.api.post('students', this.form);
    obs.subscribe({ next: () => { this.snack.open('Saved!','',{duration:2000}); this.reset(); this.load(); }, error: () => this.snack.open('Error','',{duration:2000}) });
  }
  edit(r: any) { this.editId = r.id; this.form = { name:r.name, address:r.address, guardianName:r.guardianName, contact:r.contact, facultyDetailsId:r.facultyDetailsId, gradesId:r.gradesId }; }
  delete(id: any) {
    if (!confirm('Delete student?')) return;
    this.api.delete(`students/${id}`).subscribe({ next: () => { this.snack.open('Deleted','',{duration:2000}); this.load(); } });
  }
  reset() { this.editId = null; this.form = { name:'', address:'', guardianName:'', contact:'', facultyDetailsId:null, gradesId:null }; }
}
