import { Component, inject } from '@angular/core';
import { OrderCardComponent } from '../../components/order-card/order-card.component';
import { CommonModule } from '@angular/common';
import { Order, OrderStatus } from '../../models/orders.model';
import { OrdersService } from '../../services/orders.service';

@Component({
  selector: 'app-orders-page',
  imports: [CommonModule, OrderCardComponent],
  templateUrl: './orders-page.component.html',
  styleUrl: './orders-page.component.scss'
})
export class OrdersPageComponent {
  private ordersService = inject(OrdersService);

  orders: ReadonlyArray<Order> = [];


  ngOnInit() {
    this.ordersService.getOrders().subscribe(list => this.orders = list ?? []);
  }
}

