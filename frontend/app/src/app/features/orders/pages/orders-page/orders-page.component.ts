import { Component, DestroyRef, Inject, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Order } from '../../models/orders.model';
import { OrdersService } from '../../services/orders.service';
import { OrdersStatusComponent } from '../../components/orders-status/orders-status.component';
import { OrderCardComponent } from '../../components/order-card/order-card.component';
import { TokenService } from '../../../../../core/services/token.service';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule, OrderCardComponent, OrdersStatusComponent],
  templateUrl: './orders-page.component.html',
  styleUrl: './orders-page.component.scss'
})

export class OrdersPageComponent {
  private ordersService = inject(OrdersService);
  private tokens = inject(TokenService);
  private destroyRef = inject(DestroyRef);

  private readonly MAX_SSE = 4;
  private streams = new Map<number, EventSource>();
  
  isAdmin = this.tokens.getRole() === 'ADMIN';
  orders: ReadonlyArray<Order> = [];
  readonly STATUSES = ['PREPARING','READY','CONSUMED'] as const;
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}


private attachSse(orderId: number) {
  if (this.streams.has(orderId)) return;

  const es = new EventSource(`http://localhost:5000/orders/sse/${orderId}`);

  es.addEventListener('snapshot', (e: MessageEvent) => {
    const { order } = JSON.parse(e.data);
    const id = Number(order.id);

    if (this.isAdmin && order.status === 'CONSUMED') {
      this.orders = this.orders.filter(o => o.id !== id);
      return;
    }

    this.orders = this.orders.map(o => (o.id === id ? order : o));
  });

  es.addEventListener('status_updated', (e: MessageEvent) => {
    const { id, status } = JSON.parse(e.data);
    const oid = Number(id);

    if (this.isAdmin && status === 'CONSUMED') {
      this.orders = this.orders.filter(o => o.id !== oid);
    } else {
      this.orders = this.orders.map(o => (o.id === oid ? { ...o, status } : o));
    }
  });

  es.addEventListener('order_updated', (e: MessageEvent) => {
    const updated = JSON.parse(e.data);
    const oid = Number(updated.id);

    if (this.isAdmin && updated.status === 'CONSUMED') {
      this.orders = this.orders.filter(o => o.id !== oid);
    } else {
      this.orders = this.orders.map(o => (o.id === oid ? updated : o));
    }
  });

  this.streams.set(orderId, es);
}

ngOnInit() {
  this.ordersService.getOrders().subscribe(list => {
    const base = list ?? [];
    this.orders = this.isAdmin ? base.filter(o => o.status !== 'CONSUMED') : base;

    if (isPlatformBrowser(this.platformId)) {
      for (const o of this.orders.slice(0, this.MAX_SSE)) this.attachSse(o.id);

      const sub = this.ordersService.onNewOrders().subscribe(order => {
        if (this.isAdmin && order.status === 'CONSUMED') return;
        if (!this.orders.some(o => o.id === Number(order.id))) {
          this.orders = [order, ...this.orders];
          this.ensureSse(order.id);
        }
      });
      this.destroyRef.onDestroy(() => sub.unsubscribe());
    }
  });

  this.destroyRef.onDestroy(() => {
    for (const es of this.streams.values()) es.close();
    this.streams.clear();
  });
}

ensureSse(orderId: number) {
  if (this.streams.has(orderId)) return;

  if (this.streams.size >= this.MAX_SSE) {
    const oldestId = this.streams.keys().next().value as number;
    this.streams.get(oldestId)?.close();
    this.streams.delete(oldestId);
  }
  this.attachSse(orderId);
}


  onChangeStatus(orderId: number, status: string) {
    this.ordersService.updateStatus(orderId, status).subscribe({
      next: (updated) => {
        const id = Number(updated.id);
        if (this.isAdmin && updated.status === 'CONSUMED') {
          this.orders = this.orders.filter(o => o.id !== id);
        } else {
          this.orders = this.orders.map(o => (o.id === id ? updated : o));
        }
      }
    });
  }

isSelected(current: any, option: string): boolean {
  const val = typeof current === 'string' ? current : (current?.value ?? current);
  return val === option;
}

}
