import { Component } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { OrdersService } from '../../../orders/services/orders.service';
import { CartItem } from '../../models/cart-item/cart-item.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {
  cart: CartItem[] = [];

  constructor(private cartService: CartService, private orderService: OrdersService, private router: Router) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.cart = this.cartService.getCart();
  }

  increase(id: number) {
    this.cartService.updateQuantity(id, +1);
    this.loadCart();
  }

  decrease(id: number) {
    this.cartService.updateQuantity(id, -1);
    this.loadCart();
  }

  remove(id: number) {
    this.cartService.removeFromCart(id);
    this.loadCart();
  }

  get total(): number {
    return this.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  goToProducts() {
    this.router.navigate(['/app/product-list']);
  }

  validateOrder() {
    if (this.cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    for (let item of this.cart) {
      if (item.quantity > item.product.stock) {
        alert(`Not enough stock for "${item.product.name}" (${item.product.stock} left)`);
        return;
      }
    }

    this.orderService.processOrder(this.cart).subscribe({
      next: (order) => {
        alert('Order placed successfully');
        this.cartService.clearCart();
        this.router.navigate(['/app/orders'], {
          state: { order }
        });
        this.loadCart();
      },
      error: (err) => {
        console.error('Error while processing order:', err);
        alert('Error while processing order');
      }
    });
  }
}
