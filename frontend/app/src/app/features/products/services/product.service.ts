import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = "http://localhost:5000";
  private apiUrl = `${this.baseUrl}/products/`;

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
    }>(
      `${this.apiUrl}?page=${page}`
    );
  }
  
  createProduct(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  deleteProduct(id: number) {
  return this.http.delete<{ message: string }>(`${this.baseUrl}/products/${id}`);
}

}
