import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Home } from "./pages/home/home";
import { NavbarComponent } from '../components/navbar/navbar';
import { FooterComponent } from '../components/footer/footer';
import { ToastComponent } from '../components/toast/toast';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('front');

  constructor(public authService: AuthService) {}
}
