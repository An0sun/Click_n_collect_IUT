import { Component } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart-item/cart-item.module';

@Component({
  selector: 'app-cart',
  imports: [],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  cart: CartItem[] = [];

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart() {
    this.cart = this.cartService.getCart();
  }

  increase(productId: number) {
    this.cartService.updateQuantity(productId, 1);
    this.loadCart();
  }

  decrease(productId: number) {
    this.cartService.updateQuantity(productId, -1);
    this.loadCart();
  }

  remove(productId: number) {
    this.cartService.removeFromCart(productId);
    this.loadCart();
  }

  get total(): number {
    return this.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }
}
