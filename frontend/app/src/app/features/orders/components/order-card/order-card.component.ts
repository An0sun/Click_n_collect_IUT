import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderItem } from '../../models/orders.model';

@Component({
  selector: 'app-order-card',
  imports: [CommonModule],
  templateUrl: './order-card.component.html',
  styleUrl: './order-card.component.scss'
})
export class OrderCardComponent {
  @Input({ required: true }) orderItem!: OrderItem;

}
