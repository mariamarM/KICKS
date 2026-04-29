import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductsService } from '../../services/products';
import { AuthService } from '../../services/auth';
import { CartService } from '../../services/cart'; // 👈 Import CartService
import { ToastService } from '../../services/toast.service'; // 👈 Import ToastService
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
  selectedSize: string = '';
  availableSizes: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private productsService: ProductsService,
    public authService: AuthService,
    private cartService: CartService, // 👈 Inject CartService
    private toastService: ToastService // 👈 Inject ToastService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.productsService.getProductBySlug(id)
      .subscribe({
        next: (res) => {
          this.product = res;
          if (this.product && this.product.sizes) {
            // Convertir string "36 37 38" en array ["36", "37", "38"]
            this.availableSizes = typeof this.product.sizes === 'string' 
              ? this.product.sizes.split(' ') 
              : this.product.sizes;
          }
        },
        error: (err) => {
          console.error('Error loading product detail:', err);
          // Opcional: manejar el 404 redirigiendo o mostrando un mensaje
        }
      });
  }

   addToCart() {
     if (this.product) {
       if (this.availableSizes.length > 0 && !this.selectedSize) {
         this.toastService.show('Por favor, selecciona una talla');
         return;
       }
       this.cartService.addToCart({ ...this.product, selectedSize: this.selectedSize });
       this.toastService.show(`${this.product.name} (Talla ${this.selectedSize}) añadido al carrito`);
     }
   }

  selectSize(size: string) {
    this.selectedSize = size;
  }
}
