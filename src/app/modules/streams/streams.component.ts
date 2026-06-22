import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-streams',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule, MatSnackBarModule],
  templateUrl: './streams.component.html',
  styleUrl: './streams.component.scss'
})
export class StreamsComponent implements OnInit {
  streams: any[] = []; faculties: any[] = [];
  formName = ''; formFacultyId: any = null; editId: any = null;
  cols = ['id','name','faculty','actions'];
  constructor(private api: ApiService, private snack: MatSnackBar) {}
  ngOnInit() { this.load(); this.api.get<any[]>('faculties').subscribe(d => this.faculties = d); }
  load() { this.api.get<any[]>('streams').subscribe(d => this.streams = d); }
  save() {
    if (!this.formName.trim() || !this.formFacultyId) { this.snack.open('Fill all fields','',{duration:2000}); return; }
    const body = { name: this.formName, facultyId: this.formFacultyId };
    const obs = this.editId ? this.api.put(`streams/${this.editId}`, body) : this.api.post('streams', body);
    obs.subscribe({ next: () => { this.snack.open('Saved!','',{duration:2000}); this.reset(); this.load(); }, error: () => this.snack.open('Error','',{duration:2000}) });
  }
  edit(r: any) { this.editId = r.id; this.formName = r.name; this.formFacultyId = r.facultyId; }
  delete(id: any) {
    if (!confirm('Delete this stream?')) return;
    this.api.delete(`streams/${id}`).subscribe({ next: () => { this.snack.open('Deleted','',{duration:2000}); this.load(); }, error: () => this.snack.open('Error','',{duration:2000}) });
  }
  reset() { this.editId = null; this.formName = ''; this.formFacultyId = null; }
}
