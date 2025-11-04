import { Component, OnInit } from '@angular/core';
import { Product } from '../../../products/models/product.model';
import { CustomerCardComponent } from '../../component/customer-card/customer-card.component';
import { PaginationComponent } from '../../../../shared/pagination/pagination.component';
import {
  ProductService,
  ProductPage,
} from '../../../admin-products/services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CustomerCardComponent, PaginationComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  error: string | null = null;

  page = 1;
  totalPages = 1;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (data: Product[]) => {
        this.products = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load products';
        this.loading = false;
      },
    });

    this.loadPage(1);
  }

  loadPage(newPage: number) {
    if (newPage < 1 || newPage > this.totalPages) return;

    this.page = newPage;
    this.loading = true;

    this.productService.getProductsPagines(this.page).subscribe({
      next: (res: ProductPage) => {
        this.products = res.items;
        this.totalPages = res.pages;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load products';
        this.loading = false;
      },
    });
  }
}
