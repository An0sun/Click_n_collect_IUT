import { Component, inject } from '@angular/core';
import { OrderCardComponent } from '../../components/order-card/order-card.component';
import { CommonModule } from '@angular/common';
import { Order, OrderStatus } from '../../models/orders.model';
import { OrdersService } from '../../services/orders.service';
import { OrdersStatusComponent } from '../../components/orders-status/orders-status.component';
import { TokenService } from '../../../../../core/services/token.service';

@Component({
  selector: 'app-orders-page',
  imports: [CommonModule, OrderCardComponent, OrdersStatusComponent],
  templateUrl: './orders-page.component.html',
  styleUrl: './orders-page.component.scss'
})
export class OrdersPageComponent {
  private ordersService = inject(OrdersService);
  private tokens = inject(TokenService);

  isAdmin = this.tokens.getRole() === "ADMIN";
  orders: ReadonlyArray<Order> = [];

  readonly STATUSES = ['PENDING', 'PREPARING','READY','DELIVERED'] as const;

  onChangeStatus(orderId: number, status: string) {
    this.ordersService.updateStatus(orderId, status).subscribe(updated => {
      this.orders = this.orders.map(o => (o.id === updated.id ? updated : o));
    });
  }

  ngOnInit() {
    this.ordersService.getOrders().subscribe(list => this.orders = list ?? []);
  }
}

