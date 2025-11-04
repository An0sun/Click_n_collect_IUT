import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Product } from '../models/product.model';

export interface ProductPage {
  items: Product[];
  page: number;
  per_page: number;
  total: number;
  pages: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  // Base relative au serveur qui sert l'app. Change si besoin.
  private readonly apiUrl = `/products`;

  constructor(private http: HttpClient) {}

  list(params?: {
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
    if (params?.q) p = p.set('q', params.q);
    if (params?.category) p = p.set('category', params.category);
    if (params?.sort) p = p.set('sort', params.sort);
    p = p.set('page', String(params?.page ?? 1));
    p = p.set('per_page', String(params?.per_page ?? 20));

    return this.http.get<ProductPage>(this.apiUrl, { params: p }).pipe(
      map((page) => ({
        ...page,
        items: page.items.map((it) => ({
          ...it,
          price:
            typeof it.price === 'string'
              ? parseFloat(it.price as unknown as string)
              : it.price,
          stock:
            typeof it.stock === 'string'
              ? parseInt(it.stock as unknown as string, 10)
              : it.stock,
        })),
      }))
    );
  }

  get(id: number) {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  create(product: Omit<Product, 'id'>) {
    const payload = {
      ...product,
      price: Number(product.price),
      stock: Number(product.stock),
    };
    return this.http.post<Product>(this.apiUrl, payload);
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
