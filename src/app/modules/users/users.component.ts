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
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule, MatSnackBarModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  users: any[] = []; form: any = { name:'', password:'', type:'staff' }; editId: any = null;
  cols = ['id','name','type','actions'];
  constructor(private api: ApiService, private snack: MatSnackBar) {}
  ngOnInit() { this.load(); }
  load() { this.api.get<any[]>('users').subscribe(d => this.users = d); }
  save() {
    if (!this.editId && (!this.form.name.trim()||!this.form.password.trim())) { this.snack.open('Fill all fields','',{duration:2000}); return; }
    const body: any = { type: this.form.type };
    if (!this.editId) body.name = this.form.name;
    if (this.form.password) body.password = this.form.password;
    const obs = this.editId ? this.api.put(`users/${this.editId}`, body) : this.api.post('users', { ...body, name: this.form.name });
    obs.subscribe({ next: () => { this.snack.open('Saved!','',{duration:2000}); this.reset(); this.load(); }, error: () => this.snack.open('Error','',{duration:2000}) });
  }
  edit(r: any) { this.editId = r.id; this.form = { name: r.name, password: '', type: r.type }; }
  delete(id: any) { if (!confirm('Delete user?')) return; this.api.delete(`users/${id}`).subscribe(() => { this.snack.open('Deleted','',{duration:2000}); this.load(); }); }
  reset() { this.editId = null; this.form = { name:'', password:'', type:'staff' }; }
}
