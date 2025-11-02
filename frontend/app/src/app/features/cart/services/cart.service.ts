import { Injectable } from '@angular/core';
import { Product } from '../../products/models/product.model';
import { CartItem } from '../models/cart-item/cart-item.module';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private storageKey = 'cart';
  private productsKey = 'products';

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

  getCart(): CartItem[] {
    if (!this.isBrowser()) return [];
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  saveCart(cart: CartItem[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(this.storageKey, JSON.stringify(cart));
  }

  addToCart(product: Product): void {
    let cart = this.getCart();
    const existing = cart.find(item => item.product.id === product.id);

    if (existing) {
      if (this.verifyQuantity(product.id, existing.quantity + 1, product.stock)) {
        existing.quantity++;
      } else {
        alert("Insufficient stock !");
        return;
      }
    } else {
      if (this.verifyQuantity(product.id, 1, product.stock)) {
        cart.push({ product, quantity: 1, price: product.price});
      } else {
        alert("Insufficient stock !");
        return;
      }
    }
    this.saveCart(cart);
  }

  removeFromCart(productId: number): void {
    let cart = this.getCart().filter(item => item.product.id !== productId);
    this.saveCart(cart);
  }

  updateQuantity(productId: number, change: number): void {
    let cart = this.getCart();
    const item = cart.find(i => i.product.id === productId);
    if (item) {
      const newQuantity = item.quantity + change;

      if (!this.verifyQuantity(productId, newQuantity, item.product.stock)) {
        alert("Insufficient stock !");
        return;
      }

      item.quantity = newQuantity;
      if (item.quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        this.saveCart(cart);
      }
    }
  }

  verifyQuantity(productId: number, newQuantity: number, stock: number): boolean {
    return newQuantity <= stock;
  }

  clearCart(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cart');
  }
}
}
