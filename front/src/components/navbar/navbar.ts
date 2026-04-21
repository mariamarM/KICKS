import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
  imports: [CommonModule, RouterModule],
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  userName: string = '';
  cartCount: number = 0;
  dropdownOpen: boolean = false;
  mobileMenuOpen: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkUserStatus();
    this.updateCartCount();

    // Escuchar cambios en localStorage
    window.addEventListener('storage', () => {
      this.checkUserStatus();
      this.updateCartCount();
    });
  }

  checkUserStatus(): void {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.isLoggedIn = true;
      this.isAdmin = userData.role === 'admin';
      this.userName = userData.name || (this.isAdmin ? 'Admin' : 'Usuario');
    } else {
      this.isLoggedIn = false;
      this.isAdmin = false;
      this.userName = '';
    }
  }

  updateCartCount(): void {
    const cart = localStorage.getItem('cart');
    const cartItems = cart ? JSON.parse(cart) : [];
    this.cartCount = cartItems.length;
  }

  getUserEmail(): string {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.email || 'usuario@email.com';
    }
    return '';
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    this.isLoggedIn = false;
    this.isAdmin = false;
    this.dropdownOpen = false;
    this.cartCount = 0;
    this.router.navigate(['/login']);
  }

  goToAdminProducts(): void {
    this.router.navigate(['/admin/products']);
  }

  goToAdminOrders(): void {
    this.router.navigate(['/admin/orders']);
  }

  // Cerrar dropdown al hacer click fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.dropdownOpen = false;
    }
  }
}
