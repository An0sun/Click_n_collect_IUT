import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

export type Category = 'Food' | 'Beverage';
export type StockState = 'IN_STOCK' | 'LOW' | 'OUT' | '';

export interface Product {
  id: number;
  name: string;
  description: string;
  category: Category;
  price: number;
  stock: number;
}

export interface Paged<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  pages: number;
}

export interface ProductQuery {
  page: number;
  size: number;
  sort: string;
  q: string;
  category: '' | Category;
  priceMin: string;
  priceMax: string;
  stockState: StockState;
}

@Injectable({ providedIn: 'root' })
export class ProductApi {
  private readonly http = inject(HttpClient);
  private readonly base = 'http://localhost:5000/api/products/';

  list(q: ProductQuery) {
    let p = new HttpParams()
      .set('page', String(q.page))
      .set('size', String(q.size));
    if (q.sort) p = p.set('sort', q.sort);
    if (q.q) p = p.set('q', q.q);
    if (q.category) p = p.set('category', q.category);
    if (q.priceMin) p = p.set('priceMin', q.priceMin);
    if (q.priceMax) p = p.set('priceMax', q.priceMax);
    if (q.stockState) p = p.set('stockState', q.stockState);
    return this.http.get<Paged<Product>>(this.base, { params: p });
  }

  create(body: Omit<Product, 'id'>) {
    return this.http.post<{ id: number; message: string }>(this.base, body);
  }

  update(id: number, body: Partial<Omit<Product, 'id'>>) {
    return this.http.patch<Product>(this.base + id, body);
  }

  delete(id: number) {
    return this.http.delete<{ message: string }>(this.base + id);
  }
}
