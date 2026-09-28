// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute, RouterLink } from '@angular/router';
// import { MatCardModule } from '@angular/material/card';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// import { FormsModule } from '@angular/forms';
// import { ApiService } from '../../core/services/api.service';

// @Component({
//   selector: 'app-conduct-attendance',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatSnackBarModule],
//   templateUrl: './conduct-attendance.component.html',
//   styleUrl: './conduct-attendance.component.scss'
// })
// export class ConductAttendanceComponent implements OnInit {
// getPresentCount() {
// throw new Error('Method not implemented.');
// }
// getAbsentCount() {
// throw new Error('Method not implemented.');
// }
//   attendance: any[] = [];
//   today = new Date().toLocaleDateString('en-US', {weekday:'long',year:'numeric',month:'long',day:'numeric'});
//   gsId: any;
//   constructor(private route: ActivatedRoute, private api: ApiService, private snack: MatSnackBar) {}
//   ngOnInit() {
//     this.gsId = this.route.snapshot.params['id'];
//     this.api.get<any[]>(`attendance/conduct/${this.gsId}`).subscribe(d => this.attendance = d);
//   }
//   markAll(status: boolean) { this.attendance.forEach(a => a.status = status); }
//   save() {
//     this.api.post(`attendance/process/${this.gsId}`, this.attendance).subscribe({
//       next: () => this.snack.open('Attendance saved!','',{duration:2000}),
//       error: () => this.snack.open('Error saving','',{duration:2000})
//     });
//   }
// }




import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

interface StudentRow {
  studentId: number;
  studentName: string;
  present: boolean;
}

@Component({
  selector: 'app-conduct-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatButtonModule,
    MatIconModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatSnackBarModule],
  templateUrl: './conduct-attendance.component.html',
  styleUrl: './conduct-attendance.component.scss'
})
export class ConductAttendanceComponent implements OnInit {
  gsId!: number;
  gradeName = '';
  sectionName = '';

  students: StudentRow[] = [];
  loading = true;
  saving = false;

  selectedDate: string = this.todayStr();   // yyyy-MM-dd, bound to <input type="date">
  private lastValidDate: string = this.selectedDate;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    // Works whether the route param is called "gsId" (new /attendance/take/:gsId)
    // or "id" (legacy /attendance/conduct/:id) — both land here.
    const params = this.route.snapshot.params;
    this.gsId = +(params['gsId'] ?? params['id']);

    // Pull class name from the sections list — attendance/sections already
    // has gradeName/sectionName for every class.
    this.api.get<any[]>('attendance/sections').subscribe(list => {
      const match = list.find(s => s.id === this.gsId);
      if (match) { this.gradeName = match.gradeName; this.sectionName = match.sectionName; }
    });

    this.loadStudents();
  }

  private todayStr(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /** true if the given yyyy-MM-dd string falls on a Saturday. */
  private isSaturday(dateStr: string): boolean {
    // new Date('yyyy-MM-dd') parses as UTC midnight — use noon to dodge
    // timezone rollover, then check the day of week.
    const d = new Date(dateStr + 'T12:00:00');
    return d.getDay() === 6; // 0=Sun ... 6=Sat
  }

  onDateChange() {
    if (this.isSaturday(this.selectedDate)) {
      this.snack.open('Attendance cannot be taken on Saturday — please pick another date.', '', { duration: 3000 });
      this.selectedDate = this.lastValidDate;
      return;
    }
    this.lastValidDate = this.selectedDate;
  }

  loadStudents() {
    this.loading = true;
    this.api.get<any[]>(`attendance/students/${this.gsId}`).subscribe({
      next: d => {
        this.students = d.map(s => ({ studentId: s.studentId, studentName: s.studentName, present: true }));
        this.loading = false;
      },
      error: () => { this.loading = false; this.snack.open('Could not load students', '', { duration: 2000 }); }
    });
  }

  get presentCount(): number {
    return this.students.filter(s => s.present).length;
  }

  get absentCount(): number {
    return this.students.filter(s => !s.present).length;
  }

  markAll(present: boolean) {
    this.students.forEach(s => s.present = present);
  }

  submit() {
    if (this.isSaturday(this.selectedDate)) {
      this.snack.open('Attendance cannot be taken on Saturday.', '', { duration: 3000 });
      return;
    }
    if (!this.students.length) {
      this.snack.open('No students to mark', '', { duration: 2000 });
      return;
    }

    this.saving = true;
    const body = {
      gsId: this.gsId,
      date: this.selectedDate,
      records: this.students.map(s => ({ studentId: s.studentId, present: s.present }))
    };

    this.api.post('attendance/submit', body).subscribe({
      next: () => {
        this.saving = false;
        this.snack.open('Attendance saved!', '', { duration: 2000 });
        // One step back to the class workspace — land on Daily Grid, which
        // will show today's just-submitted attendance immediately.
        this.router.navigate(['/attendance/monthly', this.gsId]);
      },
      error: (err) => {
        this.saving = false;
        this.snack.open(err?.error?.message || 'Error saving attendance', '', { duration: 3000 });
      }
    });
  }
}