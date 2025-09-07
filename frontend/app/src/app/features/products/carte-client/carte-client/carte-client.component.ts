import { Component } from '@angular/core';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-carte-client',
  standalone: true,
  imports: [],
  templateUrl: './carte-client.component.html',
  styleUrl: './carte-client.component.scss'
})

export class CarteClientComponent {
    products: Product[] = [];



}
