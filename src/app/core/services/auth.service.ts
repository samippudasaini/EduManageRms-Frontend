// // import { Injectable } from '@angular/core';
// // import { HttpClient } from '@angular/common/http';
// // import { BehaviorSubject, Observable, tap } from 'rxjs';
// // import { Router } from '@angular/router';
// // import { environment } from '../../../environments/environment';

// // export interface AuthUser { token: string; userId: number; name: string; type: string; }

// // @Injectable({ providedIn: 'root' })
// // export class AuthService {
// //   private userSubject = new BehaviorSubject<AuthUser | null>(this.getStoredUser());
// //   user$ = this.userSubject.asObservable();

// //   constructor(private http: HttpClient, private router: Router) {}
// //   changePassword(currentPassword: string, newPassword: string): Observable<any> {
// //     return this.http.put(`${environment.apiUrl}/account/change-password`, { currentPassword, newPassword },
// //       { headers: { Authorization: `Bearer ${this.getToken()}` } });
// //   }

// //   getSecurityQuestion(username: string): Observable<{ question: string }> {
// //     return this.http.get<{ question: string }>(`${environment.apiUrl}/auth/security-question`, { params: { username } });
// //   }

// //   resetPassword(username: string, answer: string, newPassword: string): Observable<any> {
// //     return this.http.post(`${environment.apiUrl}/auth/reset-password`, { username, answer, newPassword });
// //   }

// //   setSecurityQuestion(question: string, answer: string): Observable<any> {
// //     return this.http.put(`${environment.apiUrl}/account/security-question`, { question, answer },
// //       { headers: { Authorization: `Bearer ${this.getToken()}` } });
// //   }

// //   login(name: string, password: string): Observable<AuthUser> {
// //     return this.http.post<AuthUser>(`${environment.apiUrl}/auth/login`, { name, password })
// //       .pipe(tap(user => { localStorage.setItem('rms_user', JSON.stringify(user)); this.userSubject.next(user); }));
// //   }

// //   logout() { localStorage.removeItem('rms_user'); this.userSubject.next(null); this.router.navigate(['/login']); }
// //   getToken(): string | null { return this.userSubject.value?.token || null; }
// //   isLoggedIn(): boolean { return !!this.userSubject.value; }
// //   isAdmin(): boolean { return this.userSubject.value?.type === 'admin'; }
// //   getCurrentUser(): AuthUser | null { return this.userSubject.value; }

// //   private getStoredUser(): AuthUser | null {
// //     try { return JSON.parse(localStorage.getItem('rms_user') || 'null'); } catch { return null; }
// //   }
// // }


// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject, Observable, tap } from 'rxjs';
// import { Router } from '@angular/router';
// import { environment } from '../../../environments/environment';

// export interface AuthUser {
//   token: string; userId: number; name: string; type: string;
//   canAttendance?: boolean; canAssignment?: boolean; canExam?: boolean;
//   canResult?: boolean; canStudent?: boolean;
// }

// @Injectable({ providedIn: 'root' })
// export class AuthService {
//   private userSubject = new BehaviorSubject<AuthUser | null>(this.getStoredUser());
//   user$ = this.userSubject.asObservable();

//   constructor(private http: HttpClient, private router: Router) {}

//   changePassword(currentPassword: string, newPassword: string): Observable<any> {
//     return this.http.put(`${environment.apiUrl}/account/change-password`, { currentPassword, newPassword },
//       { headers: { Authorization: `Bearer ${this.getToken()}` } });
//   }

//   getSecurityQuestion(username: string): Observable<{ question: string }> {
//     return this.http.get<{ question: string }>(`${environment.apiUrl}/auth/security-question`, { params: { username } });
//   }

//   resetPassword(username: string, answer: string, newPassword: string): Observable<any> {
//     return this.http.post(`${environment.apiUrl}/auth/reset-password`, { username, answer, newPassword });
//   }

//   setSecurityQuestion(question: string, answer: string): Observable<any> {
//     return this.http.put(`${environment.apiUrl}/account/security-question`, { question, answer },
//       { headers: { Authorization: `Bearer ${this.getToken()}` } });
//   }

//  isTeacher(): boolean { return this.userSubject.value?.type === 'teacher'; }

//     can(permission: 'canAttendance'|'canAssignment'|'canExam'|'canResult'|'canStudent'): boolean {
//     if (this.isTeacher()) return !!this.userSubject.value?.[permission];
//     return true;
// }

//   login(name: string, password: string): Observable<AuthUser> {
//     return this.http.post<AuthUser>(`${environment.apiUrl}/auth/login`, { name, password })
//       .pipe(tap(user => { localStorage.setItem('rms_user', JSON.stringify(user)); this.userSubject.next(user); }));
//   }

//   logout() { localStorage.removeItem('rms_user'); this.userSubject.next(null); this.router.navigate(['/login']); }
//   getToken(): string | null { return this.userSubject.value?.token || null; }
//   isLoggedIn(): boolean { return !!this.userSubject.value; }
//   isAdmin(): boolean { return this.userSubject.value?.type === 'admin'; }
//   can(permission: 'canAttendance'|'canAssignment'|'canExam'|'canResult'|'canStudent'): boolean {
//     return this.isAdmin() || !!this.userSubject.value?.[permission];
//   }
 
//   getCurrentUser(): AuthUser | null { return this.userSubject.value; }

//   private getStoredUser(): AuthUser | null {
//     try { return JSON.parse(localStorage.getItem('rms_user') || 'null'); } catch { return null; }
//   }
// }




import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  token: string; userId: number; name: string; type: string;
  canAttendance?: boolean; canAssignment?: boolean; canExam?: boolean;
  canResult?: boolean; canStudent?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<AuthUser | null>(this.getStoredUser());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${environment.apiUrl}/account/change-password`, { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${this.getToken()}` } });
  }

  getSecurityQuestion(username: string): Observable<{ question: string }> {
    return this.http.get<{ question: string }>(`${environment.apiUrl}/auth/security-question`, { params: { username } });
  }

  resetPassword(username: string, answer: string, newPassword: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/reset-password`, { username, answer, newPassword });
  }

  setSecurityQuestion(question: string, answer: string): Observable<any> {
    return this.http.put(`${environment.apiUrl}/account/security-question`, { question, answer },
      { headers: { Authorization: `Bearer ${this.getToken()}` } });
  }

  login(name: string, password: string): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${environment.apiUrl}/auth/login`, { name, password })
      .pipe(tap(user => { localStorage.setItem('rms_user', JSON.stringify(user)); this.userSubject.next(user); }));
  }

  logout() { localStorage.removeItem('rms_user'); this.userSubject.next(null); this.router.navigate(['/login']); }
  getToken(): string | null { return this.userSubject.value?.token || null; }
  isLoggedIn(): boolean { return !!this.userSubject.value; }
  isAdmin(): boolean { return this.userSubject.value?.type === 'admin'; }
  isTeacher(): boolean { return this.userSubject.value?.type === 'teacher'; }

  can(permission: 'canAttendance'|'canAssignment'|'canExam'|'canResult'|'canStudent'): boolean {
    if (this.isTeacher()) return !!this.userSubject.value?.[permission];
    return true;
  }

  getCurrentUser(): AuthUser | null { return this.userSubject.value; }

  private getStoredUser(): AuthUser | null {
    try { return JSON.parse(localStorage.getItem('rms_user') || 'null'); } catch { return null; }
  }
}