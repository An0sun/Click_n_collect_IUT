import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProduits(): Observable<Product[]>{
    return this.http.get<Product[]>(this.apiUrl);
  }

}
