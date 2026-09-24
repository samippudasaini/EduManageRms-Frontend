

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { StudentPerformanceComponent } from './modules/performance/student-performance.component';
import { ForgotPasswordComponent } from './modules/auth/forgot-password.component';
import { ChangePasswordComponent } from './modules/account/change-password.component';
import { permissionGuard, staffOnlyGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./modules/auth/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'profile', loadComponent: () => import('./modules/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'users', loadComponent: () => import('./modules/users/users.component').then(m => m.UsersComponent) },
      { path: 'faculty', loadComponent: () => import('./modules/faculty/faculty.component').then(m => m.FacultyComponent) },
      { path: 'streams', loadComponent: () => import('./modules/streams/streams.component').then(m => m.StreamsComponent) },
      { path: 'faculty-details', loadComponent: () => import('./modules/program/programs.component').then(m => m.FacultyDetailsComponent) },
      { path: 'subjects', loadComponent: () => import('./modules/subjects/subjects.component').then(m => m.SubjectsComponent) },
      { path: 'grades', loadComponent: () => import('./modules/grades/grades.component').then(m => m.GradesComponent) },
      { path: 'students', loadComponent: () => import('./modules/students/students.component').then(m => m.StudentsComponent) },
      { path: 'student-profile/:id', loadComponent: () => import('./modules/student-profile/student-profile.component').then(m => m.StudentProfileComponent) },
      { path: 'attendance', loadComponent: () => import('./modules/attendance/attendance.component').then(m => m.AttendanceComponent) },
      { path: 'attendance/monthly/:gsId', loadComponent: () => import('./modules/attendance/attendance-monthly.component').then(m => m.AttendanceMonthlyComponent) },
      { path: 'attendance/summary/:gsId', loadComponent: () => import('./modules/attendance/attendance-summary.component').then(m => m.AttendanceSummaryComponent) },
      { path: 'attendance/conduct/:id', loadComponent: () => import('./modules/attendance/conduct-attendance.component').then(m => m.ConductAttendanceComponent) }, 
      { path: 'assignments', loadComponent: () => import('./modules/assignments/assignments.component').then(m => m.AssignmentsComponent) },
      { path: 'assignments/:gsId', loadComponent: () => import('./modules/assignments/assignment-list.component').then(m => m.AssignmentListComponent) },
      { path: 'assignments/:gsId/:aId', loadComponent: () => import('./modules/assignments/assignment-classroom.component').then(m => m.AssignmentClassroomComponent) },
      { path: 'examinations', loadComponent: () => import('./modules/examinations/examinations.component').then(m => m.ExaminationsComponent) },
      { path: 'examinations/:id', loadComponent: () => import('./modules/examinations/examination-detail.component').then(m => m.ExaminationDetailComponent) },
      // Results hub — lists all exams and their programs
      { path: 'results', loadComponent: () => import('./modules/results/results-hub.component').then(m => m.ResultsHubComponent) },
      // Results entry — marks table for a specific exam + program
      { path: 'results/:examId/:fdId', loadComponent: () => import('./modules/results/results.component').then(m => m.ResultsComponent) },
      { path: 'student-performance', component: StudentPerformanceComponent },
      // add this entry alongside your existing 'login' route:
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'change-password', component: ChangePasswordComponent },


      { path: 'users', canActivate: [staffOnlyGuard], loadComponent: () => import('./modules/users/users.component').then(m => m.UsersComponent) },
      { path: 'faculty', canActivate: [staffOnlyGuard], loadComponent: () => import('./modules/faculty/faculty.component').then(m => m.FacultyComponent) },
      { path: 'students', canActivate: [permissionGuard('canStudent')], loadComponent: () => import('./modules/students/students.component').then(m => m.StudentsComponent) },
      { path: 'attendance', canActivate: [permissionGuard('canAttendance')], loadComponent: () => import('./modules/attendance/attendance.component').then(m => m.AttendanceComponent) },
      { path: 'assignments', canActivate: [permissionGuard('canAssignment')], loadComponent: () => import('./modules/assignments/assignments.component').then(m => m.AssignmentsComponent) },
      { path: 'examinations', canActivate: [permissionGuard('canExam')], loadComponent: () => import('./modules/examinations/examinations.component').then(m => m.ExaminationsComponent) },
      { path: 'results', canActivate: [permissionGuard('canResult')], loadComponent: () => import('./modules/results/results-hub.component').then(m => m.ResultsHubComponent) },
    ]
  },
  { path: '**', redirectTo: '' }
];