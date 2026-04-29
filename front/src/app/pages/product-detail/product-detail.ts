import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductsService } from '../../services/products';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

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
    private toastService: ToastService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.productsService.getProductBySlug(id)
      .subscribe({
        next: (res) => {
          this.product = res;
          // Ordenar tallas numéricamente si existen
          if (this.product.sizes) {
            this.product.sizes = [...this.product.sizes].sort((a: number, b: number) => a - b);
          }
        },
        error: (err) => {
          console.error('Error loading product detail:', err);
        }
      });
  }

  selectSize(size: number): void {
    this.selectedSize = size;
    this.sizeError = false;
  }

  addToCart(): void {
    if (!this.authService.isLoggedIn()) return;

    // Validar talla si el producto tiene tallas
    if (this.product.sizes && this.product.sizes.length > 0 && !this.selectedSize) {
      this.sizeError = true;
      return;
    }

    // Guardar en localStorage (carrito)
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
  }
}
