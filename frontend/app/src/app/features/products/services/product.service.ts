import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { HttpClient } from '@angular/common/http';
import { map, Observable, share } from 'rxjs';
import { environment } from '../../../../environment/environment';


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly baseUrl: string = environment.baseUrl;
  private apiUrl = `${this.baseUrl}/products/`;
  private stockStream$?: Observable<{ id: number; stock: number }>;
  constructor(private http: HttpClient) {}

  private toCamel(p: any): Product {
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      description: p.description,
      price: p.price,
      stock: p.stock,
      imageUrl: p.image_url ?? null,
    };
  }

  private toSnake(data: Partial<Product>): any {
    const { imageUrl, ...rest } = data as any;
    const payload: any = { ...rest };
    if (imageUrl !== undefined) payload.image_url = imageUrl || null;
    return payload;
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<{ items: any[] }>(this.apiUrl).pipe(
      map((response) => response.items.map((p: any) => this.toCamel(p)))
    );
  }

  getProductsPagines(page: number = 1) {
    return this.http.get<{
      items: any[];
      page: number;
      per_page: number;
      total: number;
      pages: number;
    }>(`${this.apiUrl}?page=${page}`).pipe(
      map((res) => ({
        ...res,
        items: res.items.map((p: any) => this.toCamel(p)),
      }))
    );
  }



  createProduct(product: Omit<Product, 'id'>): Observable<Product> {
    const payload = this.toSnake(product);
    return this.http.post<any>(this.apiUrl, payload).pipe(map((p) => this.toCamel(p)));
  }

  deleteProduct(id: number) {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/products/${id}`);
  }

  updateProduct(id: number, patch: Partial<Product>): Observable<Product> {
    const payload = this.toSnake(patch);
    return this.http.patch<any>(`${this.apiUrl}${id}`, payload).pipe(map((p) => this.toCamel(p)));
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
