import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { CustomerCardComponent } from '../../component/customer-card/customer-card.component';
@Component({
  selector: 'app-product-list',
  standalone : true,
  imports: [ CustomerCardComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit{
  products: Product[] = [];
  loading = true;
  error: string | null = null;

  constructor(private productService: ProductService){}

  ngOnInit(): void {
      this.productService.getProduits().subscribe({
        next: (data) => {
          this.products = data;
          this.loading = false;
        },
        error : () =>{
          this.error = "Impossible de charger les produits";
          this.loading = false
        }
      })

  }
}
