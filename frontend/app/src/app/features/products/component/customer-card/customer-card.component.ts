import { Component, Input} from '@angular/core';
import { Product } from '../../models/product.model';
import { CartService } from '../../../cart/services/cart.service'; 
@Component({
  selector: 'app-customer-card',
  standalone: true,
  imports: [],
  templateUrl: './customer-card.component.html',
  styleUrl: './customer-card.component.scss'
})

export class CustomerCardComponent {
  @Input() product!: Product;
  constructor(private cartService: CartService){}

  addToCart(product: Product){
    this.cartService.addToCart(product);
  }
}
