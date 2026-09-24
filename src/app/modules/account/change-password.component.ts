import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  error = '';
  success = '';
  loading = false;

  // Recovery question fields, saved together on the same page
  securityQuestion = '';
  securityAnswer = '';
  qaError = '';
  qaSuccess = '';
  qaLoading = false;

  constructor(private auth: AuthService) {}

  changePassword(): void {
    this.error = '';
    this.success = '';
    if (!this.currentPassword) { this.error = 'Enter your current password'; return; }
    if (!this.newPassword || this.newPassword.length < 4) { this.error = 'New password must be at least 4 characters'; return; }
    if (this.newPassword !== this.confirmPassword) { this.error = 'Passwords do not match'; return; }

    this.loading = true;
    this.auth.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.success = 'Password changed successfully';
        this.loading = false;
        this.currentPassword = this.newPassword = this.confirmPassword = '';
      },
      error: (err) => {
        this.error = err?.error || 'Failed to change password';
        this.loading = false;
      },
    });
  }

  saveSecurityQuestion(): void {
    this.qaError = '';
    this.qaSuccess = '';
    if (!this.securityQuestion.trim() || !this.securityAnswer.trim()) {
      this.qaError = 'Both question and answer are required';
      return;
    }
    this.qaLoading = true;
    this.auth.setSecurityQuestion(this.securityQuestion.trim(), this.securityAnswer.trim()).subscribe({
      next: () => {
        this.qaSuccess = 'Recovery question saved';
        this.qaLoading = false;
        this.securityAnswer = '';
      },
      error: (err) => {
        this.qaError = err?.error || 'Failed to save';
        this.qaLoading = false;
      },
    });
  }
}