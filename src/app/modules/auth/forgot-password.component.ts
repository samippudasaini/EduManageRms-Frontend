import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  step: 1 | 2 = 1;
  username = '';
  question = '';
  answer = '';
  newPassword = '';
  confirmPassword = '';
  error = '';
  success = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  lookupQuestion(): void {
    if (!this.username.trim()) { this.error = 'Enter your username'; return; }
    this.error = '';
    this.loading = true;
    this.auth.getSecurityQuestion(this.username.trim()).subscribe({
      next: (res) => {
        this.question = res.question;
        this.step = 2;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error || 'No recovery question set up for this account';
        this.loading = false;
      },
    });
  }

  submitReset(): void {
    this.error = '';
    if (!this.answer.trim()) { this.error = 'Enter your answer'; return; }
    if (!this.newPassword || this.newPassword.length < 4) { this.error = 'New password must be at least 4 characters'; return; }
    if (this.newPassword !== this.confirmPassword) { this.error = 'Passwords do not match'; return; }

    this.loading = true;
    this.auth.resetPassword(this.username.trim(), this.answer.trim(), this.newPassword).subscribe({
      next: () => {
        this.success = 'Password reset. Redirecting to login…';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.error = err?.error || 'Reset failed';
        this.loading = false;
      },
    });
  }
}