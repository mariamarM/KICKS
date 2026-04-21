import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartCountSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();

  constructor() {
    // Cargar carrito del localStorage
    const savedCart = localStorage.getItem('cart');
    const cart = savedCart ? JSON.parse(savedCart) : [];
    this.cartCountSubject.next(cart.length);
  }

  addToCart(product: any): void {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    this.cartCountSubject.next(cart.length);
  }

  removeFromCart(productId: string): void {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter((item: any) => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    this.cartCountSubject.next(cart.length);
  }

  getCartCount(): number {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return cart.length;
  }
}
