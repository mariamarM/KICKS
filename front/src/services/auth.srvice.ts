import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public isAuthenticated$: BehaviorSubject<boolean>;

  constructor() {
    // Cargar usuario del localStorage
    const savedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      savedUser ? JSON.parse(savedUser) : null
    );
    this.isAuthenticated$ = new BehaviorSubject<boolean>(!!savedUser);
  }

  login(email: string, password: string): Observable<boolean> {
    // Simular login - Reemplazar con llamada real a API
    return new Observable(observer => {
      setTimeout(() => {
        // Usuario normal
        if (email === 'user@test.com' && password === '123456') {
          const user: User = {
            id: '1',
            name: 'John Doe',
            email: email,
            role: 'user'
          };
          this.setCurrentUser(user);
          observer.next(true);
          observer.complete();
        }
        // Admin
        else if (email === 'admin@test.com' && password === 'admin123') {
          const user: User = {
            id: '2',
            name: 'Admin User',
            email: email,
            role: 'admin'
          };
          this.setCurrentUser(user);
          observer.next(true);
          observer.complete();
        } else {
          observer.next(false);
          observer.complete();
        }
      }, 1000);
    });
  }

  private setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticated$.next(true);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isAuthenticated$.next(false);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserName(): string | null {
    return this.currentUserSubject.value?.name || null;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
