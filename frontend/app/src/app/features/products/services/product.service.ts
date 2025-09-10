import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = "http://localhost:5000";
  private apiUrl = `${this.baseUrl}/products`;

  constructor(private http: HttpClient) {}

  getProduits(): Observable<Product[]>{
    return this.http.get<Product[]>(this.apiUrl);
  }

}
