import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<any[]>(this.loadCart());
  cart$ = this.cartItems.asObservable();

  constructor() {}

  private loadCart(): any[] {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  }

  addToCart(product: any) {
    const currentCart = this.cartItems.value;
    const existingItem = currentCart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      currentCart.push({ ...product, quantity: 1 });
    }

    this.saveCart(currentCart);
  }

  removeFromCart(productId: string) {
    const updatedCart = this.cartItems.value.filter(item => item.id !== productId);
    this.saveCart(updatedCart);
  }

  private saveCart(cart: any[]) {
    localStorage.setItem('cart', JSON.stringify(cart));
    this.cartItems.next(cart);
  }

  clearCart() {
    this.saveCart([]);
  }

  getTotalItems() {
    return this.cartItems.value.reduce((total, item) => total + item.quantity, 0);
  }
}
