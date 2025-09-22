import { Component, Input} from '@angular/core';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-customer-card',
  standalone: true,
  imports: [],
  templateUrl: './customer-card.component.html',
  styleUrl: './customer-card.component.scss'
})

export class CustomerCardComponent {
  @Input() product!: Product;
}
