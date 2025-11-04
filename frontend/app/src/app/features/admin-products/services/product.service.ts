import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Product } from '../../products/models/product.model';

export interface ProductPage {
  items: Product[];
  page: number;
  per_page: number;
  total: number;
  pages: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `/products`;

  listPage(params: {
    q?: string;
    category?: 'Food' | 'Beverage';
    sort?:
      | 'name_asc'
      | 'name_desc'
      | 'price_asc'
      | 'price_desc'
      | 'stock_asc'
      | 'stock_desc';
    page?: number;
    per_page?: number;
  }): Observable<ProductPage> {
    let p = new HttpParams();
    if (params.q) p = p.set('q', params.q);
    if (params.category) p = p.set('category', params.category);
    if (params.sort) p = p.set('sort', params.sort);
    p = p.set('page', String(params.page ?? 1));
    p = p.set('per_page', String(params.per_page ?? 20));

    return this.http.get<ProductPage>(this.apiUrl, { params: p }).pipe(
      map((res) => ({
        ...res,
        items: res.items.map((i) => ({ ...i, price: Number(i.price) })),
      }))
    );
  }

  create(product: Omit<Product, 'id'>) {
    return this.http.post<Product>(this.apiUrl, {
      ...product,
      price: Number(product.price),
      stock: Number(product.stock),
    });
  }

  update(id: number, patch: Partial<Omit<Product, 'id'>>) {
    const payload: any = { ...patch };
    if (payload.price != null) payload.price = Number(payload.price);
    if (payload.stock != null) payload.stock = Number(payload.stock);
    return this.http.patch<Product>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
