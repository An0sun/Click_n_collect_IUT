import { Component } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart-item/cart-item.module';
import { Router } from '@angular/router';
import { OrdersService } from '../../../orders/services/orders.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.component.html',
  imports: [CommonModule],
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {
  cart: CartItem[] = [];
  placeholderUrl = 'https://images.unsplash.com/photo-1757743066455-4b5b471cdb80?q=80&w=600&auto=format&fit=crop';

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
      alert('Votre panier est vide');
      return;
    }

    for (let item of this.cart) {
      if (item.quantity > item.product.stock) {
        alert(`Stock insuffisant pour "${item.product.name}" (${item.product.stock} restant)`);
        return;
      }
    }
  this.orderService.createOrder(this.cart).subscribe({
    next: (order) => {
      alert('Commande passée avec succès');
      this.cartService.clearCart();
      this.router.navigate(['/app/order-summary'], { state: { order } });
      this.loadCart();
    }
  });
  }
}
