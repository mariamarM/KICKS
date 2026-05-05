import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductsService } from 'src/app/services/products';
import { AuthService } from 'src/app/services/auth';
import { CartService } from 'src/app/services/cart';
import { ToastService } from 'src/app/services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit {

  product: any;
  availableSizes: string[] = [];
  selectedSize: string = '';
  sizeError: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private productsService: ProductsService,
    public authService: AuthService,
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.productsService.getProductBySlug(id)
      .subscribe({
        next: (res) => {
          this.product = res;
          if (this.product && this.product.sizes) {
            this.availableSizes = typeof this.product.sizes === 'string'
              ? this.product.sizes.split(' ')
              : this.product.sizes;
          }
        },
        error: (err) => {
          console.error('Error loading product detail:', err);
        }
      });
  }

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
  }
}
