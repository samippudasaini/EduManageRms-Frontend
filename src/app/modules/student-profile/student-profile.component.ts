import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatTabsModule, MatFormFieldModule, MatInputModule, MatSnackBarModule],
  templateUrl: './student-profile.component.html',
  styleUrl: './student-profile.component.scss'
})
export class StudentProfileComponent implements OnInit {
  profile: any = null; newRemark = '';
  constructor(private route: ActivatedRoute, private api: ApiService, private snack: MatSnackBar) {}
  ngOnInit() { this.load(); }
  load() { this.api.get<any>(`student-profile/${this.route.snapshot.params['id']}`).subscribe(d => this.profile = d); }
  addRemark() {
    if (!this.newRemark.trim()) return;
    this.api.post('remarks', { studentId: this.profile.id, description: this.newRemark }).subscribe({
      next: () => { this.snack.open('Remark added','',{duration:2000}); this.newRemark=''; this.load(); },
      error: () => this.snack.open('Error','',{duration:2000})
    });
  }
}
