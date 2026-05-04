import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductsService } from '../../services/products';
import { AuthService } from '../../services/auth';
<<<<<<< HEAD
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';
=======
import { CartService } from '../../services/cart';
import { ToastService } from '../../services/toast.service';
import { CommonModule } from '@angular/common';
>>>>>>> feature-admin

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit {

  product: any;
  selectedSize: number | null = null;
  sizeError: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private productsService: ProductsService,
    public authService: AuthService,
<<<<<<< HEAD
=======
    private cartService: CartService,
>>>>>>> feature-admin
    private toastService: ToastService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.productsService.getProductBySlug(id)
      .subscribe({
        next: (res) => {
          this.product = res;
          if (this.product && this.product.sizes) {
<<<<<<< HEAD
            this.product.sizes = [...this.product.sizes].sort((a: number, b: number) => a - b);
=======
            this.availableSizes = typeof this.product.sizes === 'string' 
              ? this.product.sizes.split(' ') 
              : this.product.sizes;
>>>>>>> feature-admin
          }
        },
        error: (err) => {
          console.error('Error loading product detail:', err);
        }
      });
  }

<<<<<<< HEAD
  selectSize(size: number): void {
    this.selectedSize = size;
    this.sizeError = false;
  }

  addToCart(): void {
    if (!this.authService.isLoggedIn()) return;

    if (this.product.sizes && this.product.sizes.length > 0 && !this.selectedSize) {
      this.sizeError = true;
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((item: any) =>
      item.id === this.product.id && item.size === this.selectedSize
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: this.product.id,
        name: this.product.name,
        price: this.product.price,
        image_url: this.product.image_url,
        size: this.selectedSize,
        quantity: 1
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    this.toastService.show(`${this.product.name} (Talla ${this.selectedSize}) añadido al carrito`);
=======
  addToCart(): void {
    if (!this.product) return;

    if (this.availableSizes.length > 0 && !this.selectedSize) {
      this.toastService.show('Por favor, selecciona una talla');
      return;
    }

    this.cartService.addToCart({ 
      ...this.product, 
      selectedSize: this.selectedSize 
    });
    this.toastService.show(`${this.product.name} (Talla ${this.selectedSize}) añadido al carrito`);
  }

  selectSize(size: string): void {
    this.selectedSize = size;
>>>>>>> feature-admin
  }
}
