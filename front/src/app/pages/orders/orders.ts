import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart';
import { ToastService } from '../../services/toast.service';
import { RouterModule } from '@angular/router';

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

  constructor(private cartService: CartService, private toastService: ToastService) {}

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
    this.toastService.show('¡Pedido realizado con éxito! Gracias por tu compra.');
    this.cartService.clearCart();
  }
}
