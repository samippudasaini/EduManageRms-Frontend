import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ApiService } from '../../core/services/api.service';
import { PerformancePredictionService, PredictionRequest } from './performance-prediction.service';

interface StudentRow {
  id: number;
  name: string;
  attendance: number;
  assignmentScore: number;
  midtermScore: number;
  participation: number;
  prevGpa: number;
  category?: string;
  confidence?: number;
  quickCategory?: string;
  loading?: boolean;
  error?: string;
}

@Component({
  selector: 'app-student-performance',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatCardModule],
  templateUrl: './student-performance.component.html',
  styleUrl: './student-performance.component.scss',
})
export class StudentPerformanceComponent implements OnInit {
  students: StudentRow[] = [];
  loadingList = true;
  searchTerm = '';
  filterCategory = 'all';

  constructor(private api: ApiService, private predictionService: PerformancePredictionService) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loadingList = true;
    this.api.get<any[]>('students').subscribe({
      next: (data) => {
        this.students = (data || []).map((s) => ({
          id: s.id,
          name: s.name,
          // Fields below don't exist on your Student entity yet — defaulted to 75
          // until real attendance/assignment/midterm/participation/GPA columns exist.
          attendance: s.attendance ?? 75,
          assignmentScore: s.assignmentScore ?? 75,
          midtermScore: s.midtermScore ?? 75,
          participation: s.participation ?? 75,
          prevGpa: s.prevGpa ?? 3.0,
        }));
        this.loadingList = false;
        this.predictAll();
      },
      error: () => {
        this.loadingList = false;
      },
    });
  }

  predictAll(): void {
    for (const student of this.students) {
      this.predictOne(student);
    }
  }

  predictOne(student: StudentRow): void {
    student.loading = true;
    student.error = undefined;
    const req: PredictionRequest = {
      studentId: student.id,
      attendance: student.attendance,
      assignmentScore: student.assignmentScore,
      midtermScore: student.midtermScore,
      participation: student.participation,
      prevGpa: student.prevGpa,
    };
    this.predictionService.predict(req).subscribe({
      next: (res) => {
        student.loading = false;
        if (res.error) {
          student.error = res.error;
          return;
        }
        student.category = res.category;
        student.confidence = res.confidence;
        student.quickCategory = res.quick_category;
      },
      error: (err) => {
        student.loading = false;
        student.error = err?.error?.error || 'Prediction failed';
      },
    });
  }

  get filteredStudents(): StudentRow[] {
    return this.students.filter((s) => {
      const matchesSearch = s.name?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory =
        this.filterCategory === 'all' || s.category === this.filterCategory;
      return matchesSearch && matchesCategory;
    });
  }

  categoryColor(category?: string): string {
    const map: Record<string, string> = {
      Excellent: '#16a34a',
      Good: '#2563eb',
      Average: '#d97706',
      'Needs Improvement': '#ea580c',
      'At Risk': '#dc2626',
    };
    return category ? map[category] || '#6b7280' : '#6b7280';
  }
}