import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface AuthUser { token: string; userId: number; name: string; type: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<AuthUser | null>(this.getStoredUser());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(name: string, password: string): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${environment.apiUrl}/auth/login`, { name, password })
      .pipe(tap(user => { localStorage.setItem('rms_user', JSON.stringify(user)); this.userSubject.next(user); }));
  }

  logout() { localStorage.removeItem('rms_user'); this.userSubject.next(null); this.router.navigate(['/login']); }
  getToken(): string | null { return this.userSubject.value?.token || null; }
  isLoggedIn(): boolean { return !!this.userSubject.value; }
  isAdmin(): boolean { return this.userSubject.value?.type === 'admin'; }
  getCurrentUser(): AuthUser | null { return this.userSubject.value; }

  private getStoredUser(): AuthUser | null {
    try { return JSON.parse(localStorage.getItem('rms_user') || 'null'); } catch { return null; }
  }
}
