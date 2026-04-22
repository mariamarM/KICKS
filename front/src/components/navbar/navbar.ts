import { Component, OnInit, HostListener, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.srvice';

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
  private lastUserCheck: string = '';

  constructor(private router: Router, private authService: AuthService, private cdr: ChangeDetectorRef, private ngZone: NgZone) {}

  ngOnInit(): void {
    this.checkUserStatus();
    this.lastUserCheck = localStorage.getItem('user') || '';
    this.updateCartCount();

    this.ngZone.runOutsideAngular(() => {
      setInterval(() => {
        const currentUser = localStorage.getItem('user') || '';
        if (currentUser !== this.lastUserCheck) {
          this.lastUserCheck = currentUser;
          this.ngZone.run(() => {
            this.checkUserStatus();
            this.updateCartCount();
            this.cdr.detectChanges();
          });
        }
      }, 500);
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
    this.authService.logout();
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
