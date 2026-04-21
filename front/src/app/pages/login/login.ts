import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [],
  inputs: [],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router) {}

  onLogin(): void {
    // Simular login (después conectarás con API real)
    if (this.email === 'user@test.com' && this.password === '123456') {
      const user = {
        id: 1,
        name: 'Usuario Normal',
        email: this.email,
        role: 'user'
      };
      localStorage.setItem('user', JSON.stringify(user));
      this.router.navigate(['/']);
    }
    else if (this.email === 'admin@test.com' && this.password === 'admin123') {
      const user = {
        id: 2,
        name: 'Administrador',
        email: this.email,
        role: 'admin'
      };
      localStorage.setItem('user', JSON.stringify(user));
      this.router.navigate(['/']);
    }
    else {
      this.errorMessage = 'Email o contraseña incorrectos';
    }
  }
}
