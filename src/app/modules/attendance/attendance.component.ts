import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.scss'
})
export class AttendanceComponent implements OnInit {
  sections: any[] = [];       // full list of grade+section classes, from the backend
  loading = true;

  selectedGrade: string | null = null;   // null = "All Grades"
  selectedSection: string | null = null; // null = "All Sections" (ignored when grade-only search)

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<any[]>('attendance/sections').subscribe({
      next: d => { this.sections = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  /** Distinct grade names available, for the Grade dropdown. */
  get gradeOptions(): string[] {
    const names = this.sections.map(s => s.gradeName).filter(Boolean);
    return Array.from(new Set(names));
  }

  /** Section options for the currently selected grade only. */
  get sectionOptions(): string[] {
    if (!this.selectedGrade) return [];
    const names = this.sections
      .filter(s => s.gradeName === this.selectedGrade)
      .map(s => s.sectionName)
      .filter(Boolean);
    return Array.from(new Set(names));
  }

  onGradeChange() {
    // Changing the grade resets the section filter — a section from a
    // different grade would no longer make sense.
    this.selectedSection = null;
  }

  /** The classes to actually show, after applying the filter. */
  get filteredSections(): any[] {
    return this.sections.filter(s => {
      if (this.selectedGrade && s.gradeName !== this.selectedGrade) return false;
      // If no section is chosen, a grade-only search matches every section
      // under that grade — the section filter is simply ignored.
      if (this.selectedSection && s.sectionName !== this.selectedSection) return false;
      return true;
    });
  }

  clearFilters() {
    this.selectedGrade = null;
    this.selectedSection = null;
  }
}