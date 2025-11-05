import { Component, Input} from '@angular/core';
import { Product } from '../../models/product.model';
import { CartService } from '../../../cart/services/cart.service';
import { CartItem} from '../../../cart/models/cart-item/cart-item.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-card',
  standalone: true,
  imports: [],
  templateUrl: './customer-card.component.html',
  styleUrl: './customer-card.component.scss'
})

export class CustomerCardComponent {
  @Input() product!: Product;
  placeholderUrl = 'https://images.unsplash.com/photo-1757743066455-4b5b471cdb80?q=80&w=600&auto=format&fit=crop';
  constructor(private cartService: CartService, private router: Router){}

  addToCart(product: Product) {
    const cart: CartItem[] = this.cartService.getCart();

    const existing = cart.find(item => item.product.id === product.id);

    if (existing) {
      alert(`The product "${product.name}" is already in your cart!`);
      return;
    }

    this.cartService.addToCart(product);
    alert(`"${product.name}" has been added to your cart.`);
  }

  goToCart(){
    this.router.navigate(['/app/cart'])
  }
}
