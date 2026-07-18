import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../core/services/api.service';

type Status = 'PENDING' | 'DONE' | 'LATE' | 'NOT_DONE';

@Component({
  selector: 'app-assignment-classroom',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatButtonModule,
    MatIconModule, MatSnackBarModule, MatTooltipModule],
  templateUrl: './assignment-classroom.component.html',
  styleUrl: './assignment-classroom.component.scss'
})
export class AssignmentClassroomComponent implements OnInit {
  gsId!: number;
  aId!: number;
  assignment: any = null;
  submissions: any[] = [];
  loading = true;
  savingId: number | null = null;

  // Track which student's remarks input is visible
  remarksVisible: Set<number> = new Set();

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.gsId = +this.route.snapshot.params['gsId'];
    this.aId  = +this.route.snapshot.params['aId'];
    this.load();
  }

  load() {
    this.loading = true;
    // Load assignment details
    this.api.get<any[]>(`assignments/grade/${this.gsId}`).subscribe({
      next: list => {
        this.assignment = list.find(a => a.id === this.aId) || null;
      }
    });
    // Load submissions
    this.api.get<any[]>(`assignments/${this.aId}/submissions`).subscribe({
      next: data => {
        this.submissions = data;
        // Pre-open remarks for LATE/NOT_DONE
        data.forEach(s => {
          if (s.submissionStatus === 'LATE' || s.submissionStatus === 'NOT_DONE')
            this.remarksVisible.add(s.id);
        });
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  /**
   * Auto-save on status click — fires PATCH immediately.
   * No global Save button needed.
   */
  setStatus(submission: any, status: Status) {
    const prev = submission.submissionStatus;
    submission.submissionStatus = status;

    // Show remarks for LATE/NOT_DONE, hide for DONE/PENDING
    if (status === 'LATE' || status === 'NOT_DONE') {
      this.remarksVisible.add(submission.id);
    } else {
      this.remarksVisible.delete(submission.id);
      submission.remarks = '';
    }

    this.savingId = submission.id;
    this.api.patch(`assignments/submissions/${submission.id}/status`, {
      status,
      remarks: submission.remarks || ''
    }).subscribe({
      next: (res: any) => {
        this.savingId = null;
        submission.submissionStatus = res.submissionStatus;
      },
      error: () => {
        this.savingId = null;
        submission.submissionStatus = prev; // revert on error
        this.snack.open('Failed to save status', '', { duration: 2000 });
      }
    });
  }

  /** Save remarks inline — fires on blur of remarks input */
  saveRemarks(submission: any) {
    this.api.patch(`assignments/submissions/${submission.id}/status`, {
      status: submission.submissionStatus,
      remarks: submission.remarks || ''
    }).subscribe({ error: () => {} });
  }

  /** Mark ALL students as DONE instantly */
  markAllDone() {
    this.api.patch(`assignments/${this.aId}/mark-all-done`, {}).subscribe({
      next: () => {
        this.submissions.forEach(s => {
          s.submissionStatus = 'DONE';
          s.remarks = '';
          this.remarksVisible.delete(s.id);
        });
        this.snack.open('All students marked as DONE', '', { duration: 2000 });
      },
      error: () => this.snack.open('Error', '', { duration: 2000 })
    });
  }

  rowClass(status: string): string {
    switch (status) {
      case 'DONE':     return 'row-done';
      case 'LATE':     return 'row-late';
      case 'NOT_DONE': return 'row-notdone';
      default:         return 'row-pending';
    }
  }

  stats() {
    const total    = this.submissions.length;
    const done     = this.submissions.filter(s => s.submissionStatus === 'DONE').length;
    const late     = this.submissions.filter(s => s.submissionStatus === 'LATE').length;
    const notDone  = this.submissions.filter(s => s.submissionStatus === 'NOT_DONE').length;
    const pending  = this.submissions.filter(s => s.submissionStatus === 'PENDING').length;
    return { total, done, late, notDone, pending };
  }
}