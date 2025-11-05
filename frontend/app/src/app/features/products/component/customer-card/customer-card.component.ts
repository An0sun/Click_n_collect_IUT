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
  placeholderUrl = 'https://images.unsplash.com/photo-1574282341541-0b3ed53adcd2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=688';
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
