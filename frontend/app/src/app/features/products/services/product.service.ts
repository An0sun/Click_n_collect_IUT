import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { HttpClient } from '@angular/common/http';
import { map, Observable, share } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = "http://localhost:5000";
  private apiUrl = `${this.baseUrl}/products/`;
  private stockStream$?: Observable<{ id: number; stock: number }>;
  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<{ items: Product[] }>(this.apiUrl).pipe(
      map((response: { items: Product[] }) => response.items)
    );
  }

  getProductsPagines(page: number = 1) {
    return this.http.get<{
      items: Product[];
      page: number;
      per_page: number;
      total: number;
      pages: number;
    }>(`${this.apiUrl}?page=${page}`);
  }



  createProduct(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  deleteProduct(id: number) {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/products/${id}`);
  }

  updateProduct(id: number, patch: Partial<Product>): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}${id}`, patch);
  }

  onStockUpdates(): Observable<{ id: number; stock: number }> {
    if (!this.stockStream$) {
      const stream = new Observable<{ id: number; stock: number }>((sub) => {
        const es = new EventSource(`${this.baseUrl}/products/sse`);

        const onStock = (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data) as { id: number; stock: number };
            sub.next({ id: Number(data.id), stock: Number(data.stock) });
          } catch (err) {
          }
        };

        es.addEventListener('stock_updated', onStock);

        return () => {
          es.removeEventListener('stock_updated', onStock as any);
          es.close();
        };
      }).pipe(share());

      this.stockStream$ = stream;
    }
    return this.stockStream$!;
  }
  
}