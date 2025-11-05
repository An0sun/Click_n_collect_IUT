import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, switchMap, of, throwError, share } from 'rxjs';
import { CartItem } from '../../cart/models/cart-item/cart-item.module';
import { TokenService } from '../../../../core/services/token.service';
import { Order, OrdersPage } from '../models/orders.model';
import { environment } from '../../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private readonly baseUrl: string = environment.baseUrl;
  private apiUrl = `${this.baseUrl}/orders`;
  private tokenService = inject(TokenService);
  private newOrders$?: Observable<Order>;

  constructor(private http: HttpClient) {}

  onNewOrders(): Observable<Order> {
    if (!this.newOrders$) {
      const stream: Observable<Order> = new Observable<Order>((sub) => {
        const es = new EventSource(`${this.apiUrl}/sse`);


        const onCreated = (e: MessageEvent) => {
          try {
            const { order } = JSON.parse(e.data);
            sub.next(order as Order);
          } catch (err) {
          }
        };

        es.addEventListener('order_created', onCreated);

        return () => {

          es.removeEventListener('order_created', onCreated as any);
          es.close();
        };
      }).pipe(share());

      this.newOrders$ = stream;
    }
    return this.newOrders$!;
  }
  
  createOrder(cart: CartItem[]): Observable<Order> {
    const tokenData = this.tokenService['dec']?.();

    if (!tokenData) {
      return throwError(() => new Error('User not logged in'));
    }

    const customer_name = tokenData.name || 'Unknown Customer';
    const email = tokenData.email || 'unknown@example.com';

    const orderData = {
      customer_name,
      email,
      total: cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      items: cart.map(i => ({
        product_id: i.product.id,
        product_name: i.product.name,
        quantity: i.quantity,
        price: i.product.price
      }))
    };

    return this.http.post<Order>(this.apiUrl, orderData);
  }

  getOrders(page = 1) {
    return this.http.get<OrdersPage>(`${this.apiUrl}?page=${page}`);
  }
  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }
  updateStatus(id: number, status: string) {
    return this.http.patch<Order>(`${this.apiUrl}/${id}`, { status });
  }

}
