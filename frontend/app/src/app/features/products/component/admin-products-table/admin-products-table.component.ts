import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-products-table',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-products-table.component.html',
})
export class AdminProductsTableComponent {
  @Input() products: Product[] = [];
  @Input() loading = false;
  @Input() page = 1;
  @Input() pages = 1;
  @Input() total = 0;
  @Input() perPage?: number;

  @Output() pageChange = new EventEmitter<number>();
  @Output() editRequest = new EventEmitter<number>();
  @Output() deleteProduct = new EventEmitter<number>();

  placeholderUrl = 'https://via.placeholder.com/100x100?text=No+Image';

  trackById = (_: number, p: Product) => p.id;

  first() { if (this.page !== 1) this.pageChange.emit(1); }
  prev()  { if (this.page > 1) this.pageChange.emit(this.page - 1); }
  next()  { if (this.page < this.pages) this.pageChange.emit(this.page + 1); }
  last()  { if (this.page !== this.pages) this.pageChange.emit(this.pages); }
}
