// // import { Component, OnInit } from '@angular/core';
// // import { CommonModule } from '@angular/common';
// // import { FormsModule } from '@angular/forms';
// // import { MatTableModule } from '@angular/material/table';
// // import { MatButtonModule } from '@angular/material/button';
// // import { MatIconModule } from '@angular/material/icon';
// // import { MatFormFieldModule } from '@angular/material/form-field';
// // import { MatInputModule } from '@angular/material/input';
// // import { MatSelectModule } from '@angular/material/select';
// // import { MatCardModule } from '@angular/material/card';
// // import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// // import { ApiService } from '../../core/services/api.service';

// // @Component({
// //   selector: 'app-users',
// //   standalone: true,
// //   imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule,
// //     MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule, MatSnackBarModule],
// //   templateUrl: './users.component.html',
// //   styleUrl: './users.component.scss'
// // })
// // export class UsersComponent implements OnInit {
// //   users: any[] = []; form: any = { name:'', password:'', type:'staff' }; editId: any = null;
// //   cols = ['id','name','type','actions'];
// //   constructor(private api: ApiService, private snack: MatSnackBar) {}
// //   ngOnInit() { this.load(); }
// //   load() { this.api.get<any[]>('users').subscribe(d => this.users = d); }
// //   save() {
// //     if (!this.editId && (!this.form.name.trim()||!this.form.password.trim())) { this.snack.open('Fill all fields','',{duration:2000}); return; }
// //     const body: any = { type: this.form.type };
// //     if (!this.editId) body.name = this.form.name;
// //     if (this.form.password) body.password = this.form.password;
// //     const obs = this.editId ? this.api.put(`users/${this.editId}`, body) : this.api.post('users', { ...body, name: this.form.name });
// //     obs.subscribe({ next: () => { this.snack.open('Saved!','',{duration:2000}); this.reset(); this.load(); }, error: () => this.snack.open('Error','',{duration:2000}) });
// //   }
// //   edit(r: any) { this.editId = r.id; this.form = { name: r.name, password: '', type: r.type }; }
// //   delete(id: any) { if (!confirm('Delete user?')) return; this.api.delete(`users/${id}`).subscribe(() => { this.snack.open('Deleted','',{duration:2000}); this.load(); }); }
// //   reset() { this.editId = null; this.form = { name:'', password:'', type:'staff' }; }
// // }




// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { MatTableModule } from '@angular/material/table';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
// import { MatCardModule } from '@angular/material/card';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// import { ApiService } from '../../core/services/api.service';
// import { catchError, forkJoin, of } from 'rxjs';

// @Component({
//   selector: 'app-users',
//   standalone: true,
//   imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule,
//     MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule, MatCheckboxModule, MatSnackBarModule],
//   templateUrl: './users.component.html',
//   styleUrl: './users.component.scss'
// })
// export class UsersComponent implements OnInit {
//   users: any[] = [];
//   facultyDetails: any[] = [];
//   form: any = {
//     name: '', password: '', type: 'staff', facultyDetailId: null,
//     canAttendance: false, canAssignment: false, canExam: false, canResult: false, canStudent: false
//   };
//   editId: any = null;
//   cols = ['id', 'name', 'type', 'actions'];

//   constructor(private api: ApiService, private snack: MatSnackBar) {}

//   ngOnInit() {
//     forkJoin({
//       users: this.api.get<any[]>('users').pipe(catchError(() => of([]))),
//       facultyDetails: this.api.get<any[]>('faculty-details').pipe(catchError(() => of([])))
//     }).subscribe(r => { this.users = r.users; this.facultyDetails = r.facultyDetails; });
//   }

//   load() { this.api.get<any[]>('users').subscribe(d => this.users = d); }

//   isTeacher(): boolean { return this.form.type === 'teacher'; }

//   save() {
//     if (!this.editId && (!this.form.name.trim() || !this.form.password.trim())) {
//       this.snack.open('Fill all fields', '', { duration: 2000 }); return;
//     }
//     const body: any = {
//       type: this.form.type,
//       facultyDetailId: this.form.type === 'teacher' ? this.form.facultyDetailId : null,
//       canAttendance: this.form.canAttendance,
//       canAssignment: this.form.canAssignment,
//       canExam: this.form.canExam,
//       canResult: this.form.canResult,
//       canStudent: this.form.canStudent
//     };
//     if (!this.editId) body.name = this.form.name;
//     if (this.form.password) body.password = this.form.password;

//     const obs = this.editId
//       ? this.api.put(`users/${this.editId}`, body)
//       : this.api.post('users', { ...body, name: this.form.name });

//     obs.subscribe({
//       next: () => { this.snack.open('Saved!', '', { duration: 2000 }); this.reset(); this.load(); },
//       error: () => this.snack.open('Error', '', { duration: 2000 })
//     });
//   }

//   edit(r: any) {
//     this.editId = r.id;
//     this.form = {
//       name: r.name, password: '', type: r.type,
//       canAttendance: !!r.canAttendance, canAssignment: !!r.canAssignment,
//       canExam: !!r.canExam, canResult: !!r.canResult, canStudent: !!r.canStudent
//     };
//   }

//   delete(id: any) {
//     if (!confirm('Delete user?')) return;
//     this.api.delete(`users/${id}`).subscribe(() => { this.snack.open('Deleted', '', { duration: 2000 }); this.load(); });
//   }

//   reset() {
//     this.editId = null;
//     this.form = {
//       name: '', password: '', type: 'staff', facultyDetailId: null,
//       canAttendance: false, canAssignment: false, canExam: false, canResult: false, canStudent: false
//     };
//   }

//   programName(fdId: any): string {
//     const fd = this.facultyDetails.find(f => f.id === fdId);
//     return fd ? fd.name : '-';
//   }
// }


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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule, MatCheckboxModule, MatSnackBarModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  form: any = {
    name: '', password: '', type: 'staff',
    canAttendance: false, canAssignment: false, canExam: false, canResult: false, canStudent: false
  };
  editId: any = null;
  cols = ['id', 'name', 'type', 'actions'];

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit() {
    this.load();
  }

  load() { this.api.get<any[]>('users').subscribe(d => this.users = d); }

  isTeacher(): boolean { return this.form.type === 'teacher'; }

  save() {
    if (!this.editId && (!this.form.name.trim() || !this.form.password.trim())) {
      this.snack.open('Fill all fields', '', { duration: 2000 }); return;
    }
    const body: any = {
      type: this.form.type,
      canAttendance: this.form.canAttendance,
      canAssignment: this.form.canAssignment,
      canExam: this.form.canExam,
      canResult: this.form.canResult,
      canStudent: this.form.canStudent
    };
    if (!this.editId) body.name = this.form.name;
    if (this.form.password) body.password = this.form.password;

    const obs = this.editId
      ? this.api.put(`users/${this.editId}`, body)
      : this.api.post('users', { ...body, name: this.form.name });

    obs.subscribe({
      next: () => { this.snack.open('Saved!', '', { duration: 2000 }); this.reset(); this.load(); },
      error: () => this.snack.open('Error', '', { duration: 2000 })
    });
  }

  edit(r: any) {
    this.editId = r.id;
    this.form = {
      name: r.name, password: '', type: r.type,
      canAttendance: !!r.canAttendance, canAssignment: !!r.canAssignment,
      canExam: !!r.canExam, canResult: !!r.canResult, canStudent: !!r.canStudent
    };
  }

  delete(id: any) {
    if (!confirm('Delete user?')) return;
    this.api.delete(`users/${id}`).subscribe(() => { this.snack.open('Deleted', '', { duration: 2000 }); this.load(); });
  }

  reset() {
    this.editId = null;
    this.form = {
      name: '', password: '', type: 'staff',
      canAttendance: false, canAssignment: false, canExam: false, canResult: false, canStudent: false
    };
  }
}