import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/services/cart';
import { ToastService } from 'src/app/services/toast.service';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  items: any[] = [];
  total: number = 0;

  constructor(
    private cartService: CartService, 
    private toastService: ToastService,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.cartService.cart$.subscribe(items => {
      this.items = items;
      this.calculateTotal();
    });
  }

  calculateTotal() {
    this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  removeItem(id: string) {
    this.cartService.removeFromCart(id);
  }

  checkout() {
    const user = this.authService.getUser();
    if (!user) {
      this.toastService.show('Debes estar registrado para realizar un pedido');
      return;
    }

    const orderData = {
      items: this.items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        size: item.size || null
      })),
      shipping_address: '', // TODO: Implement shipping address collection
      notes: '' // TODO: Implement notes collection
    };

    this.http.post('/api/orders', orderData).subscribe({
      next: (response: any) => {
        this.toastService.show('¡Pedido realizado con éxito! Gracias por tu compra.');
        this.cartService.clearCart();
      },
      error: (error) => {
        console.error('Error creating order:', error);
        this.toastService.show('Error al realizar el pedido. Por favor, inténtalo de nuevo.');
      }
    });
  }
}
