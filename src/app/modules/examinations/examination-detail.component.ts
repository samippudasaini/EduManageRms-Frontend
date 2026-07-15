// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ActivatedRoute, RouterLink } from '@angular/router';
// import { MatCardModule } from '@angular/material/card';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatSelectModule } from '@angular/material/select';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatChipsModule } from '@angular/material/chips';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// import { ApiService } from '../../core/services/api.service';

// @Component({
//   selector: 'app-examination-detail',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule,
//     MatSelectModule, MatFormFieldModule, MatChipsModule, MatSnackBarModule],
//   templateUrl: './examination-detail.component.html',
//   styleUrl: './examination-detail.component.scss'
// })
// export class ExaminationDetailComponent implements OnInit {
//   exam: any = null; allPrograms: any[] = []; selectedFdId: any = null;
//   constructor(private route: ActivatedRoute, private api: ApiService, private snack: MatSnackBar) {}
//   ngOnInit() {
//     this.api.get<any[]>('faculty-details').subscribe(d => this.allPrograms = d);
//     this.load();
//   }
//   load() { this.api.get<any>(`examinations/${this.route.snapshot.params['id']}`).subscribe(d => this.exam = d); }
//   assignFd() {
//     if (!this.selectedFdId) { this.snack.open('Select a program','',{duration:2000}); return; }
//     this.api.post(`examinations/${this.exam.id}/faculty-details`, { facultyDetailId: this.selectedFdId }).subscribe({
//       next: () => { this.snack.open('Program assigned! Results created for all students.','',{duration:3000}); this.selectedFdId=null; this.load(); },
//       error: () => this.snack.open('Error','',{duration:2000})
//     });
//   }
//   removeFd(fdId: any) {
//     if (!confirm('Remove this program from exam?')) return;
//     this.api.delete(`examinations/${this.exam.id}/faculty-details/${fdId}`).subscribe({ next: () => { this.snack.open('Removed','',{duration:2000}); this.load(); } });
//   }
// }


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-examination-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatFormFieldModule, MatChipsModule, MatSnackBarModule],
  templateUrl: './examination-detail.component.html',
  styleUrl: './examination-detail.component.scss'
})
export class ExaminationDetailComponent implements OnInit {
  exam: any = null;
  allPrograms: any[] = [];
  selectedFdId: any = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.api.get<any[]>('faculty-details').subscribe(d => this.allPrograms = d);
    this.load();
  }

  load() {
    const id = this.route.snapshot.params['id'];
    this.api.get<any>(`examinations/${id}`).subscribe(d => this.exam = d);
  }

  assignProgram() {
    if (!this.selectedFdId) {
      this.snack.open('Select a program first', '', { duration: 2000 });
      return;
    }
    this.api.post(`examinations/${this.exam.id}/faculty-details`, {
      facultyDetailId: this.selectedFdId
    }).subscribe({
      next: () => {
        this.snack.open('Program assigned! Result rows created for all students.', '', { duration: 3000 });
        this.selectedFdId = null;
        this.load();
      },
      error: () => this.snack.open('Error assigning program', '', { duration: 2000 })
    });
  }

  removeProgram(fdId: any) {
    if (!confirm('Remove this program from exam? This will delete all related results.')) return;
    this.api.delete(`examinations/${this.exam.id}/faculty-details/${fdId}`).subscribe({
      next: () => {
        this.snack.open('Program removed', '', { duration: 2000 });
        this.load();
      },
      error: () => this.snack.open('Error removing program', '', { duration: 2000 })
    });
  }

  availablePrograms(): any[] {
    if (!this.exam?.facultyDetails) return this.allPrograms;
    const assigned = new Set(this.exam.facultyDetails.map((f: any) => f.id));
    return this.allPrograms.filter(p => !assigned.has(p.id));
  }
}