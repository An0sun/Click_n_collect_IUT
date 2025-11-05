import { Component, DestroyRef, inject, OnInit} from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { ProductCardComponent } from '../../component/product-card/product-card.component';
import { PaginationComponent } from '../../../../shared/pagination/pagination.component';
@Component({
  selector: 'app-product-list',
  standalone : true,
  imports: [ ProductCardComponent, PaginationComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit{
  products: Product[] = [];
  loading = true;
  error: string | null = null;
  private destroyRef = inject(DestroyRef);
  constructor(private productService: ProductService){}

  page = 1
  totalPages = 1

  ngOnInit(): void {
      this.productService.getProducts().subscribe({
        next: (data) => {
          this.products = data;
          this.loading = false;
        },
        error : () =>{
          this.error = "Impossible de charger les produits";
          this.loading = false
        }
      })

      this.loadPage(1)
      const sub = this.productService.onStockUpdates().subscribe(({ id, stock }) => {
      this.products = this.products.map(p => (p.id === id ? { ...p, stock } : p));
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  loadPage(newPage: number) {
    if (newPage < 1 || newPage > this.totalPages) return;

    this.page = newPage;
    this.loading = true;

    this.productService.getProductsPagines(this.page).subscribe({
      next: (res) => {
        this.products = res.items;
        this.totalPages = res.pages;
        this.loading = false;
      },
      error: () => {
        this.error = "Impossible de charger les produits";
        this.loading = false;
      }
    });
  }
  
}
