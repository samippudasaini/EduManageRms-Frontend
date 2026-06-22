import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatCardModule, MatSnackBarModule],
  templateUrl: './subjects.component.html',
  styleUrl: './subjects.component.scss'
})
export class SubjectsComponent implements OnInit {
  subjects: any[] = [];
  form = { name:'', theory:0, practical:0, fullMarks:0, passMarks:0, creditHour:0 };
  editId: any = null;
  cols = ['id','name','theory','practical','fullMarks','passMarks','creditHour','actions'];
  constructor(private api: ApiService, private snack: MatSnackBar) {}
  ngOnInit() { this.load(); }
  load() { this.api.get<any[]>('subjects').subscribe(d => this.subjects = d); }
  save() {
    if (!this.form.name.trim()) { this.snack.open('Enter subject name','',{duration:2000}); return; }
    const obs = this.editId ? this.api.put(`subjects/${this.editId}`, this.form) : this.api.post('subjects', this.form);
    obs.subscribe({ next: () => { this.snack.open('Saved!','',{duration:2000}); this.reset(); this.load(); }, error: () => this.snack.open('Error','',{duration:2000}) });
  }
  edit(r: any) { this.editId = r.id; this.form = { name:r.name, theory:r.theory, practical:r.practical, fullMarks:r.fullMarks, passMarks:r.passMarks, creditHour:r.creditHour }; }
  delete(id: any) {
    if (!confirm('Delete subject?')) return;
    this.api.delete(`subjects/${id}`).subscribe({ next: () => { this.snack.open('Deleted','',{duration:2000}); this.load(); }, error: () => this.snack.open('Error','',{duration:2000}) });
  }
  reset() { this.editId = null; this.form = { name:'', theory:0, practical:0, fullMarks:0, passMarks:0, creditHour:0 }; }
}
