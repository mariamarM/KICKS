import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private userProfile: UserProfile | null = null;

  constructor(private http: HttpClient, private router: Router) {
    // Restore user profile from localStorage on service init (survives page refresh)
    const stored = localStorage.getItem('user_profile');
    if (stored) {
      try { this.userProfile = JSON.parse(stored); } catch { this.userProfile = null; }
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
          // Persist user profile (including role) across page reloads
          this.userProfile = response.user;
          localStorage.setItem('user_profile', JSON.stringify(response.user));
        }
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  getProfile(): Observable<UserProfile> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token available'));
    }
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`).pipe(
      tap(profile => {
        this.userProfile = profile;
        localStorage.setItem('user_profile', JSON.stringify(profile));
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_profile');
    this.userProfile = null;
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.userProfile?.role === 'admin';
  }

  getUser(): UserProfile | null {
    return this.userProfile;
  }
}