import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-faculty',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatCardModule, MatSnackBarModule],
  templateUrl: './faculty.component.html',
  styleUrl: './faculty.component.scss'
})
export class FacultyComponent implements OnInit {
  faculties: any[] = []; formName = ''; editId: any = null;
  cols = ['id','name','actions'];
  constructor(private api: ApiService, private snack: MatSnackBar) {}
  ngOnInit() { this.load(); }
  load() { this.api.get<any[]>('faculties').subscribe(d => this.faculties = d); }
  save() {
    if (!this.formName.trim()) return;
    const obs = this.editId ? this.api.put(`faculties/${this.editId}`,{name:this.formName}) : this.api.post('faculties',{name:this.formName});
    obs.subscribe({ next: () => { this.snack.open('Saved!','',{duration:2000}); this.reset(); this.load(); }, error: () => this.snack.open('Error saving','',{duration:2000}) });
  }
  edit(r: any) { this.editId = r.id; this.formName = r.name; }
  delete(id: any) {
    if (!confirm('Delete this faculty?')) return;
    this.api.delete(`faculties/${id}`).subscribe({ next: () => { this.snack.open('Deleted','',{duration:2000}); this.load(); }, error: () => this.snack.open('Error','',{duration:2000}) });
  }
  reset() { this.editId = null; this.formName = ''; }
}
