import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:3000/api/auth';

  constructor(private router: Router, private http: HttpClient) {}

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin';
  }

  login(credentials: any) {
    return this.http.post<any>(`${this.baseUrl}/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('user', JSON.stringify(res.user));
      })
    );
  }

  register(userData: any) {
    return this.http.post<any>(`${this.baseUrl}/register`, userData);
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('cart');
    this.router.navigate(['/login']);
  }

  getEmail(): string {
    const user = this.getUser();
    return user?.email || '';
  }

  getName(): string {
    const user = this.getUser();
    return user?.full_name || user?.name || (this.isAdmin() ? 'Admin' : 'Usuario');
  }
}
