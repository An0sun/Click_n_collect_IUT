import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = "http://localhost:5000";
  private apiUrl = `${this.baseUrl}/api/products/`;

  constructor(private http: HttpClient) {}

  getProduits(): Observable<Product[]> {
    return this.http.get<{ items: Product[] }>(this.apiUrl).pipe(
      map(response => response.items) 
    );
  }

}
