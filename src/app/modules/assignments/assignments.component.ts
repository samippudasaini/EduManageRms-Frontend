// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { MatCardModule } from '@angular/material/card';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
// import { MatTabsModule } from '@angular/material/tabs';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// import { ApiService } from '../../core/services/api.service';

// @Component({
//   selector: 'app-assignments',
//   standalone: true,
//   imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
//     MatFormFieldModule, MatInputModule, MatSelectModule, MatTabsModule, MatCheckboxModule, MatSnackBarModule],
//   templateUrl: './assignments.component.html',
//   styleUrl: './assignments.component.scss'
// })
// export class AssignmentsComponent implements OnInit {
//   assignments: any[] = []; gradeSections: any[] = []; classStudents: any[] = [];
//   form: any = { name:'', date: new Date().toISOString().split('T')[0], gradesId: null };
//   selectedAssignment: any = null;
//   constructor(private api: ApiService, private snack: MatSnackBar) {}
//   ngOnInit() { this.api.get<any[]>('grade-sections').subscribe(d => this.gradeSections = d); }
//   loadAssignments() {
//     if (this.form.gradesId) this.api.get<any[]>(`assignments/grade/${this.form.gradesId}`).subscribe(d => this.assignments = d);
//   }
//   addAssignment() {
//     if (!this.form.name.trim()||!this.form.gradesId) { this.snack.open('Fill all fields','',{duration:2000}); return; }
//     this.api.post('assignments', this.form).subscribe({ next: () => { this.snack.open('Assignment added','',{duration:2000}); this.form.name=''; this.loadAssignments(); }, error: () => this.snack.open('Error','',{duration:2000}) });
//   }
//   viewClass(a: any) {
//     this.selectedAssignment = a;
//     this.api.get<any[]>(`assignments/${a.id}/grade/${a.gradesId}/date/${a.date}`).subscribe(d => this.classStudents = d);
//   }
//   saveSubmissions() {
//     this.api.post(`assignments/process/${this.selectedAssignment.id}/${this.selectedAssignment.gradesId}/${this.selectedAssignment.date}`, this.classStudents)
//       .subscribe({ next: () => { this.snack.open('Saved!','',{duration:2000}); this.selectedAssignment=null; }, error: () => this.snack.open('Error','',{duration:2000}) });
//   }
//   deleteAssignment(id: any) {
//     if (!confirm('Delete assignment?')) return;
//     this.api.delete(`assignments/${id}`).subscribe({ next: () => { this.snack.open('Deleted','',{duration:2000}); this.loadAssignments(); } });
//   }
// }

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-assignments',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatBadgeModule],
  templateUrl: './assignments.component.html',
  styleUrl: './assignments.component.scss'
})
export class AssignmentsComponent implements OnInit {
  cards: any[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<any[]>('assignments/dashboard').subscribe({
      next: d => { this.cards = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}