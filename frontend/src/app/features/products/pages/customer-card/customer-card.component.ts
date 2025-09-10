import { Component } from '@angular/core';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-customer-card',
  standalone: true,
  imports: [],
  templateUrl: './customer-card.component.html',
  styleUrl: './customer-card.component.scss'
})

export class CustomerCardComponent {
  products: Product[] = [];   
  loading: boolean = true;    
  error: string | null = null; 

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loading = true;   
    this.error = null;     
  
    this.productService.getProduits().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false; 
      },
      error: (err) => {
        console.error("Erreur:", err);
        this.error = "Impossible de charger les produits"; 
        this.loading = false; 
      }
    });
  }
  


}
