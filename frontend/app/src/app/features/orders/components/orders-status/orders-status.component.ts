import { Component, Input } from '@angular/core';
import { OrderStatus } from '../../models/orders.model';

@Component({
  selector: 'app-orders-status',
  imports: [],
  templateUrl: './orders-status.component.html',
  styleUrl: './orders-status.component.scss'
})
export class OrdersStatusComponent {
  @Input({ required: true }) status!: OrderStatus;

  get label(): string {
    switch (this.status) {
      case 'PREPARING': return 'PREPARING';
      case 'READY': return 'READY';
      case 'CONSUMED': return 'CONSUMED';
      default: return this.status ?? '';
    }
  }
}
