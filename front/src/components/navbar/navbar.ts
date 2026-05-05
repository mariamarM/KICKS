import { Component, OnInit, HostListener, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth';
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

  constructor(private router: Router, private AuthService: AuthService, private cdr: ChangeDetectorRef, private ngZone: NgZone) {}

  ngOnInit(): void {
    this.checkUserStatus();
    this.lastUserCheck = localStorage.getItem('access_token') || '';
    this.updateCartCount();

    this.ngZone.runOutsideAngular(() => {
      setInterval(() => {
        const currentToken = localStorage.getItem('access_token') || '';
        if (currentToken !== this.lastUserCheck) {
          this.lastUserCheck = currentToken;
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
    const token = this.AuthService.getToken();
    if (token) {
      const user = this.AuthService.getUser();
      if (user) {
        this.isLoggedIn = true;
        this.isAdmin = user.role === 'admin';
        this.userName = user.full_name || (this.isAdmin ? 'Admin' : 'Usuario');
      } else {
        // If we don't have user cached, fetch from profile
        this.AuthService.getProfile().subscribe({
          next: (profile) => {
            this.isLoggedIn = true;
            this.isAdmin = profile.role === 'admin';
            this.userName = profile.full_name || (this.isAdmin ? 'Admin' : 'Usuario');
          },
          error: () => {
            // If we can't get profile, clear token and redirect to login
            this.AuthService.logout();
          }
        });
      }
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
    const user = this.AuthService.getUser();
    if (user) {
      return user.email || 'usuario@email.com';
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
    this.AuthService.logout();
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
