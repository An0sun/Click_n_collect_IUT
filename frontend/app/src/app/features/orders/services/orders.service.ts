import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, switchMap, of, throwError } from 'rxjs';
import { CartItem } from '../../cart/models/cart-item/cart-item.module';
import { TokenService } from '../../../../core/services/token.service';
import { Order } from '../models/orders.model';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private baseUrl = "http://localhost:5000";
  private apiUrl = `${this.baseUrl}/orders`;
  private productsUrl = `${this.baseUrl}/products`;

  private tokenService = inject(TokenService);

  constructor(private http: HttpClient) {}

  createOrder(cart: CartItem[]): Observable<Order> {
    const tokenData = this.tokenService['dec']?.();

    if (!tokenData) {
      console.error('Invalid token or user not logged in.');
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

  private decrementStocks(cart: CartItem[]): Observable<any[]> {
    const requests = cart.map(item =>
    this.http.patch(`${this.productsUrl}/${item.product.id}`, {
        stock: item.product.stock - item.quantity
      })
    );
    return forkJoin(requests);
  }

  processOrder(cart: CartItem[]): Observable<any> {
    if (!this.tokenService.isLoggedIn()) {
      console.error('User not logged in.');
      return throwError(() => new Error('User not logged in'));
    }

    return this.createOrder(cart).pipe(
      switchMap(order =>
        this.decrementStocks(cart).pipe(
          switchMap(() => of(order))
        )
      )
    );
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }
  
  updateStatus(id: number, status: string) {
    return this.http.patch<Order>(`${this.apiUrl}/${id}`, { status });
  }

}
