import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from 'src/app/services/cart';
import { ToastService } from 'src/app/services/toast.service';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth';
import { OrdersService, Order } from 'src/app/services/orders.service';

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
  
  // Historial de pedidos
  myOrders: Order[] = [];
  loadingOrders = false;

  constructor(
    private cartService: CartService, 
    private toastService: ToastService,
    private http: HttpClient,
    private authService: AuthService,
    private ordersService: OrdersService
  ) {}

  ngOnInit() {
    this.cartService.cart$.subscribe(items => {
      this.items = items;
      this.calculateTotal();
    });

    if (this.authService.isLoggedIn()) {
      this.loadMyOrders();
    }
  }

  loadMyOrders() {
    this.loadingOrders = true;
    this.ordersService.getUserOrders().subscribe({
      next: (res) => {
        this.myOrders = res;
        this.loadingOrders = false;
      },
      error: (err) => {
        console.error('Error loading my orders:', err);
        this.loadingOrders = false;
      }
    });
  }

  getOrdersByStatus(status: string): Order[] {
    return this.myOrders.filter(o => o.status === status);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Espera/Pendiente',
      confirmed: 'Confirmado',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
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
        size: item.selectedSize || null
      })),
      shipping_address: 'Finalización de compra manual',
      notes: ''
    };

    this.ordersService.createOrder(orderData).subscribe({
      next: (response: any) => {
        this.toastService.show('¡Pedido realizado con éxito! Gracias por tu compra.');
        this.cartService.clearCart();
        this.loadMyOrders(); // Recargamos para ver el nuevo pedido
      },
      error: (error) => {
        console.error('Error creating order:', error);
        const errorMsg = error.error?.message || 'Error al realizar el pedido. Por favor, inténtalo de nuevo.';
        this.toastService.show(errorMsg);
      }
    });
  }
}


