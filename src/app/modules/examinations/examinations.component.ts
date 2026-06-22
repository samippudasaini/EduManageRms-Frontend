import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-examinations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSnackBarModule],
  templateUrl: './examinations.component.html',
  styleUrl: './examinations.component.scss'
})
export class ExaminationsComponent implements OnInit {
  examinations: any[] = []; form: any = { name:'', year:'' }; editId: any = null;
  constructor(private api: ApiService, private snack: MatSnackBar) {}
  ngOnInit() { this.load(); }
  load() { this.api.get<any[]>('examinations').subscribe(d => this.examinations = d); }
  save() {
    if (!this.form.name.trim()) { this.snack.open('Enter exam name','',{duration:2000}); return; }
    const obs = this.editId ? this.api.put(`examinations/${this.editId}`, this.form) : this.api.post('examinations', this.form);
    obs.subscribe({ next: () => { this.snack.open('Saved!','',{duration:2000}); this.reset(); this.load(); }, error: () => this.snack.open('Error','',{duration:2000}) });
  }
  edit(e: any) { this.editId = e.id; this.form = { name: e.name, year: e.year }; }
  delete(id: any) { if (!confirm('Delete?')) return; this.api.delete(`examinations/${id}`).subscribe(() => { this.snack.open('Deleted','',{duration:2000}); this.load(); }); }
  reset() { this.editId = null; this.form = { name:'', year:'' }; }
}
