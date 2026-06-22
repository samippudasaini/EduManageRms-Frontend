import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../core/services/api.service';

export interface CollegeProfile {
  name: string;
  address: string;
  email: string;
  phone: string;
  principalName: string;
  slogan: string;
  importantInfo: string;
  logoUrl?: string;
}

const EMPTY_PROFILE: CollegeProfile = {
  name: '', address: '', email: '', phone: '',
  principalName: '', slogan: '', importantInfo: '', logoUrl: ''
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatSnackBarModule, MatIconModule, MatTooltipModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  form: CollegeProfile = { ...EMPTY_PROFILE };
  profileId: any = null;
  editMode = false;
  saving = false;
  defaultLogo = 'assets/img/college-logo-placeholder.svg';

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit() {
    this.api.get<any>('profile').subscribe({
      next: d => {
        if (d) {
          this.profileId = d.id;
          this.form = { ...EMPTY_PROFILE, ...d };
        } else {
          // Nothing saved yet - drop straight into edit mode for first-time setup
          this.editMode = true;
        }
      },
      error: () => { this.editMode = true; }
    });
  }

  get logoSrc(): string {
    return this.form.logoUrl ? this.form.logoUrl : this.defaultLogo;
  }

  toggleEdit() {
    this.editMode = !this.editMode;
  }

  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.snack.open('Please choose an image file', '', { duration: 2500 });
      return;
    }
    if (file.size > 1024 * 1024 * 2) {
      this.snack.open('Logo image should be under 2MB', '', { duration: 2500 });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.form.logoUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeLogo() {
    this.form.logoUrl = '';
  }

  save() {
    this.saving = true;
    const obs = this.profileId
      ? this.api.put(`profile/${this.profileId}`, this.form)
      : this.api.post('profile', this.form);

    obs.subscribe({
      next: (d: any) => {
        this.profileId = d.id;
        this.saving = false;
        this.editMode = false;
        this.snack.open('Profile saved!', '', { duration: 2000 });
      },
      error: () => {
        this.saving = false;
        this.snack.open('Could not save profile', '', { duration: 2000 });
      }
    });
  }
}
