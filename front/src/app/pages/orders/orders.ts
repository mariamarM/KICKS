import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart';
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

  constructor(private cartService: CartService) {}

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
    alert('Función de pago no implementada aún. ¡Gracias por tu pedido!');
    this.cartService.clearCart();
  }
}
