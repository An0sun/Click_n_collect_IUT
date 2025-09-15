import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = "http://localhost:5000";
  private apiUrl = `${this.baseUrl}/api/products/`;

  constructor(private http: HttpClient) {}

  getProduits(): Observable<Product[]> {
    return this.http.get<{ items: Product[] }>(this.apiUrl).pipe(
      map((response: { items: Product[] }) => response.items)
    );
  }

  createProduct(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  deleteProduct(id: number) {
  return this.http.delete<{ message: string }>(`${this.baseUrl}/api/products/${id}`);
}
}
