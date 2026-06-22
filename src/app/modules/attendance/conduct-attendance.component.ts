import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-conduct-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatSnackBarModule],
  templateUrl: './conduct-attendance.component.html',
  styleUrl: './conduct-attendance.component.scss'
})
export class ConductAttendanceComponent implements OnInit {
  attendance: any[] = [];
  today = new Date().toLocaleDateString('en-US', {weekday:'long',year:'numeric',month:'long',day:'numeric'});
  gsId: any;
  constructor(private route: ActivatedRoute, private api: ApiService, private snack: MatSnackBar) {}
  ngOnInit() {
    this.gsId = this.route.snapshot.params['id'];
    this.api.get<any[]>(`attendance/conduct/${this.gsId}`).subscribe(d => this.attendance = d);
  }
  markAll(status: boolean) { this.attendance.forEach(a => a.status = status); }
  save() {
    this.api.post(`attendance/process/${this.gsId}`, this.attendance).subscribe({
      next: () => this.snack.open('Attendance saved!','',{duration:2000}),
      error: () => this.snack.open('Error saving','',{duration:2000})
    });
  }
}
