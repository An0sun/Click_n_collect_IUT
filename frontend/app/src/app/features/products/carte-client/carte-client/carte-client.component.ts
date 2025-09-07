import { Component } from '@angular/core';
import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';

@Component({
  selector: 'app-carte-client',
  standalone: true,
  imports: [],
  templateUrl: './carte-client.component.html',
  styleUrl: './carte-client.component.scss'
})

export class CarteClientComponent {
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
