import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AdminProductsTableComponent } from '../../component/admin-products-table/admin-products-table.component';
import { ProductUpdateComponent } from '../../component/product-update/product-update.component';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-admin-products-page',
  standalone: true,
  imports: [CommonModule, AdminProductsTableComponent, ProductUpdateComponent],
  templateUrl: './admin-products-page.component.html',
})
export class AdminProductsPageComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  loading = true;
  saving = false;

  page?: number;
  pages?: number;
  total?: number;
  perPage?: number;

  editingProduct: Product | null = null;

  private subs = new Subscription();

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadPage(1);
    const stockSub = this.productService.onStockUpdates().subscribe(({ id, stock }) => {
      this.products = this.products.map(p => (p.id === id ? { ...p, stock } : p));
    });
    this.subs.add(stockSub);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadPage(requestedPage: number): void {
    this.loading = true;

    const sub = this.productService.getProductsPagines(requestedPage).subscribe({
      next: (res) => {
        this.products = res.items;
        this.page     = res.page;
        this.pages    = res.pages;
        this.total    = res.total;
        this.perPage  = res.per_page;
        this.loading  = false;
      }
    });

    this.subs.add(sub);
  }

  onPageChange(p: number) { this.loadPage(p); }

  onAskEdit(id: number) {
    this.editingProduct = this.products.find(x => x.id === id) || null;
  }

  onUpdateSaved() {
    this.editingProduct = null;
    this.loadPage(this.page ?? 1);
  }
  onUpdateCancel() {
    this.editingProduct = null;
  }

  onDelete(id: number) {
    this.loading = true;
    const dSub = this.productService.deleteProduct(id).subscribe({
      next: () => this.loadPage(this.page ?? 1),
    });
    this.subs.add(dSub);
  }
}
