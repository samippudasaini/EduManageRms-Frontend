import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <mat-icon class="warn-icon">warning</mat-icon>
        <h2>{{ data.title }}</h2>
      </div>

      <div class="dialog-body">
        <p class="student-name">{{ data.studentName }}</p>
        <p class="warning-text">
          Deleting this student will permanently remove all their data:
        </p>
        <ul class="items-list">
          <li *ngFor="let item of data.items">
            <mat-icon class="list-icon">remove_circle_outline</mat-icon>
            {{ item }}
          </li>
        </ul>
        <p class="cannot-undo">This action cannot be undone.</p>
      </div>

      <div class="dialog-footer">
        <button mat-stroked-button (click)="dialogRef.close(false)">
          Cancel
        </button>
        <button mat-raised-button color="warn" (click)="dialogRef.close(true)">
          <mat-icon>delete</mat-icon> Yes, Delete Student
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container { padding: 0; min-width: 380px; }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 24px 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    .warn-icon {
      color: #e53935;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 18px;
      color: #1a237e;
      font-weight: 600;
    }

    .dialog-body {
      padding: 18px 24px;
    }

    .student-name {
      font-size: 16px;
      font-weight: 700;
      color: #263238;
      margin: 0 0 12px;
    }

    .warning-text {
      font-size: 13px;
      color: #546e7a;
      margin: 0 0 10px;
    }

    .items-list {
      list-style: none;
      padding: 0;
      margin: 0 0 14px;
    }

    .items-list li {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 5px 0;
      font-size: 13px;
      color: #37474f;
    }

    .list-icon {
      color: #e53935;
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .cannot-undo {
      font-size: 12px;
      font-weight: 600;
      color: #e53935;
      margin: 0;
      padding: 8px 12px;
      background: #ffebee;
      border-radius: 6px;
      border-left: 3px solid #e53935;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 14px 24px 20px;
      border-top: 1px solid #f0f0f0;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      studentName: string;
      items: string[];
    }
  ) {}
}