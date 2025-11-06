import { Component, DestroyRef, Inject, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { Order } from '../../models/orders.model';
import { OrdersService } from '../../services/orders.service';
import { OrdersStatusComponent } from '../../components/orders-status/orders-status.component';
import { OrderCardComponent } from '../../components/order-card/order-card.component';
import { TokenService } from '../../../../../core/services/token.service';
import { environment } from '../../../../../environment/environment';
import { PaginationComponent } from '../../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule, OrderCardComponent, OrdersStatusComponent, PaginationComponent],
  templateUrl: './orders-page.component.html',
  styleUrl: './orders-page.component.scss',
})
export class OrdersPageComponent {
  private readonly baseUrl: string = environment.baseUrl;
  private ordersService = inject(OrdersService);
  private tokens = inject(TokenService);
  private destroyRef = inject(DestroyRef);

  private readonly MAX_SSE = 4;
  private streams = new Map<number, EventSource>();

  isAdmin = this.tokens.getRole() === 'ADMIN';
  orders: ReadonlyArray<Order> = [];
  readonly STATUSES = ['PREPARATION', 'PRET', 'CONSOMEE'] as const;

  loading = true;
  page = 1;
  pages = 1;
  perPage = 20;
  total = 0;

  private subs = new Subscription();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.loadPage(1);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    for (const es of this.streams.values()) es.close();
    this.streams.clear();
  }

  loadPage(requestedPage: number): void {
    this.loading = true;

    const sub = this.ordersService.getOrders(requestedPage).subscribe({
      next: (res) => {
        this.orders = this.isAdmin
          ? res.items.filter((o: Order) => o.status !== 'CONSOMEE')
          : res.items;

        this.page = res.page;
        this.pages = res.pages;
        this.total = res.total;
        this.perPage = res.per_page;
        this.loading = false;

        if (isPlatformBrowser(this.platformId)) {
          // Réinitialiser les SSE existants
          for (const es of this.streams.values()) es.close();
          this.streams.clear();

          // Attacher SSE aux premières commandes visibles
          for (const o of this.orders.slice(0, this.MAX_SSE)) this.attachSse(o.id);

          // Écouter les nouvelles commandes temps réel
          const subSse = this.ordersService.onNewOrders().subscribe((order) => {
            if (this.isAdmin && order.status === 'CONSOMEE') return;
            if (!this.orders.some((o) => o.id === Number(order.id))) {
              this.orders = [order, ...this.orders].slice(0, this.perPage);
              this.ensureSse(order.id);
              this.total += 1;
            }
          });

          this.destroyRef.onDestroy(() => subSse.unsubscribe());
        }
      },
    });

    this.subs.add(sub);
  }

  private attachSse(orderId: number) {
    if (this.streams.has(orderId)) return;

    const es = new EventSource(new URL(`orders/sse/${orderId}`, this.baseUrl).toString());

    es.addEventListener('snapshot', (e: MessageEvent) => {
      const { order } = JSON.parse(e.data);
      const id = Number(order.id);

      if (this.isAdmin && order.status === 'CONSOMEE') {
        this.orders = this.orders.filter((o) => o.id !== id);
        return;
      }

      this.orders = this.orders.map((o) => (o.id === id ? order : o));
    });

    es.addEventListener('status_updated', (e: MessageEvent) => {
      const { id, status } = JSON.parse(e.data);
      const oid = Number(id);

      if (this.isAdmin && status === 'CONSOMEE') {
        this.orders = this.orders.filter((o) => o.id !== oid);
      } else {
        this.orders = this.orders.map((o) => (o.id === oid ? { ...o, status } : o));
      }
    });

    es.addEventListener('order_updated', (e: MessageEvent) => {
      const updated = JSON.parse(e.data);
      const oid = Number(updated.id);

      if (this.isAdmin && updated.status === 'CONSOMEE') {
        this.orders = this.orders.filter((o) => o.id !== oid);
      } else {
        this.orders = this.orders.map((o) => (o.id === oid ? updated : o));
      }
    });

    this.streams.set(orderId, es);
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
        if (this.isAdmin && updated.status === 'CONSOMEE') {
          this.orders = this.orders.filter((o) => o.id !== id);
        } else {
          this.orders = this.orders.map((o) => (o.id === id ? updated : o));
        }
      },
    });
  }

  isSelected(current: any, option: string): boolean {
    const val = typeof current === 'string' ? current : current?.value ?? current;
    return val === option;
  }
}
