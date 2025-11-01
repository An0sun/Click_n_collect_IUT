import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductApi, Product, ProductQuery } from '../services/product.api';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe],
  template: `
    <header class="toolbar" role="toolbar" aria-label="Actions">
      <button
        type="button"
        class="btn primary"
        (click)="new()"
        aria-label="Add product"
      >
        + Add product
      </button>
    </header>

    <form
      [formGroup]="form"
      class="filters"
      role="search"
      aria-label="Filter products"
    >
      <input
        formControlName="q"
        type="search"
        placeholder="Search by name or description"
        aria-label="Search"
      />
      <select formControlName="category" aria-label="Category">
        <option value="">All categories</option>
        <option value="Food">Food</option>
        <option value="Beverage">Beverage</option>
      </select>
      <input
        formControlName="priceMin"
        type="number"
        inputmode="decimal"
        step="0.01"
        placeholder="Min €"
        aria-label="Min price"
      />
      <input
        formControlName="priceMax"
        type="number"
        inputmode="decimal"
        step="0.01"
        placeholder="Max €"
        aria-label="Max price"
      />
      <select formControlName="stockState" aria-label="Stock state">
        <option value="">Any stock</option>
        <option value="IN_STOCK">In stock</option>
        <option value="LOW">Low stock</option>
        <option value="OUT">Out of stock</option>
      </select>
    </form>

    <div role="table" aria-label="Products list" class="table">
      <div role="rowgroup" class="thead">
        <div role="row" class="tr">
          <div
            role="columnheader"
            class="th sortable"
            (click)="setSort('name')"
            tabindex="0"
            aria-label="Sort by name"
          >
            Name
          </div>
          <div role="columnheader" class="th">Description</div>
          <div role="columnheader" class="th">Category</div>
          <div
            role="columnheader"
            class="th sortable"
            (click)="setSort('price')"
            tabindex="0"
            aria-label="Sort by price"
          >
            Price
          </div>
          <div
            role="columnheader"
            class="th sortable"
            (click)="setSort('stock')"
            tabindex="0"
            aria-label="Sort by stock"
          >
            Stock
          </div>
          <div role="columnheader" class="th">Actions</div>
        </div>
      </div>

      <div role="rowgroup" class="tbody">
        @for (p of products(); track p.id) {
        <div role="row" class="tr">
          <div role="cell" class="td">{{ p.name }}</div>
          <div role="cell" class="td">{{ p.description }}</div>
          <div role="cell" class="td">{{ p.category }}</div>
          <div role="cell" class="td">{{ p.price | number : '1.2-2' }} €</div>
          <div role="cell" class="td">
            {{ p.stock }}
            @if (p.stock === 0) {
            <span class="badge danger" aria-label="Out of stock">Out</span> }
            @if (p.stock > 0 && p.stock < 5) {
            <span class="badge warn" aria-label="Low stock">Low</span> }
          </div>
          <div role="cell" class="td actions">
            <button
              type="button"
              class="icon"
              aria-label="Edit"
              (click)="edit(p)"
            >
              ✎
            </button>
            <button
              type="button"
              class="icon danger"
              aria-label="Delete"
              (click)="del(p)"
            >
              🗑
            </button>
          </div>
        </div>
        }
      </div>
    </div>

    <nav class="pager" aria-label="Pagination">
      <button
        type="button"
        (click)="goto(page() - 1)"
        [disabled]="page() <= 1"
        aria-label="Previous page"
      >
        Prev
      </button>
      <span aria-live="polite">Page {{ page() }} of {{ pages() }}</span>
      <button
        type="button"
        (click)="goto(page() + 1)"
        [disabled]="page() >= pages()"
        aria-label="Next page"
      >
        Next
      </button>
    </nav>
  `,
  styles: [
    `
      .toolbar {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 16px;
      }
      .btn {
        padding: 8px 12px;
        border: 1px solid currentColor;
        background: transparent;
        cursor: pointer;
      }
      .btn.primary {
        border-color: #2e2e2e;
      }
      .filters {
        display: grid;
        grid-template-columns: 1fr 160px 120px 120px 160px;
        gap: 8px;
        margin-bottom: 12px;
      }
      .table {
        width: 100%;
        border: 1px solid #ddd;
        border-radius: 6px;
        overflow: hidden;
      }
      .thead .tr,
      .tbody .tr {
        display: grid;
        grid-template-columns: 1.2fr 1.6fr 0.8fr 0.6fr 0.6fr 0.6fr;
        align-items: center;
      }
      .th,
      .td {
        padding: 10px 12px;
      }
      .th.sortable {
        cursor: pointer;
        text-decoration: underline;
      }
      .tbody .tr {
        border-top: 1px solid #eee;
      }
      .actions {
        display: flex;
        gap: 8px;
      }
      .icon {
        background: transparent;
        border: 1px solid #444;
        padding: 4px 8px;
        cursor: pointer;
      }
      .icon.danger {
        border-color: #a00;
      }
      .badge {
        margin-left: 8px;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
      }
      .badge.warn {
        background: #ffedcc;
        color: #8a4b00;
      }
      .badge.danger {
        background: #f4d6d6;
        color: #8a0000;
      }
      .pager {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-top: 12px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class ProductTableComponent {
  private readonly api = inject(ProductApi);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly qp = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  readonly query = signal<ProductQuery>({
    page: Number(this.qp().get('page')) || 1,
    size: Number(this.qp().get('size')) || 20,
    sort: this.qp().get('sort') || '',
    q: this.qp().get('q') || '',
    category: (this.qp().get('category') as any) || '',
    priceMin: this.qp().get('priceMin') || '',
    priceMax: this.qp().get('priceMax') || '',
    stockState: (this.qp().get('stockState') as any) || '',
  });

  readonly form = this.fb.nonNullable.group({
    q: this.query().q,
    category: this.query().category,
    priceMin: this.query().priceMin,
    priceMax: this.query().priceMax,
    stockState: this.query().stockState,
  });

  readonly products = signal<Product[]>([]);
  readonly page = signal(this.query().page);
  readonly size = signal(this.query().size);
  readonly total = signal(0);
  readonly pages = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.size()))
  );

  constructor() {
    effect(() => {
      const qp = this.qp();
      this.query.update((q) => ({
        ...q,
        page: Number(qp.get('page')) || 1,
        size: Number(qp.get('size')) || 20,
        sort: qp.get('sort') || q.sort,
        q: qp.get('q') || '',
        category: (qp.get('category') as any) || '',
        priceMin: qp.get('priceMin') || '',
        priceMax: qp.get('priceMax') || '',
        stockState: (qp.get('stockState') as any) || '',
      }));
      this.form.setValue(
        {
          q: this.query().q,
          category: this.query().category,
          priceMin: this.query().priceMin,
          priceMax: this.query().priceMax,
          stockState: this.query().stockState,
        },
        { emitEvent: false }
      );
      this.fetch();
    });

    this.form.valueChanges.subscribe((v) =>
      this.updateQuery({ ...v, page: 1 })
    );
  }

  fetch(): void {
    const q = this.query();
    this.api.list(q).subscribe((res) => {
      this.products.set(res.items);
      this.page.set(res.page);
      this.size.set(res.size);
      this.total.set(res.total);
    });
  }

  updateQuery(p: Partial<ProductQuery>): void {
    const current = this.route.snapshot.queryParams;
    this.router.navigate([], {
      queryParams: { ...current, ...p },
      queryParamsHandling: 'merge',
    });
  }

  setSort(field: 'name' | 'price' | 'stock'): void {
    const current = this.query().sort;
    const [f, dir] = current ? current.split(',') : ['', ''];
    const nextDir = f === field && dir === 'asc' ? 'desc' : 'asc';
    this.updateQuery({ sort: `${field},${nextDir}` });
  }

  goto(p: number): void {
    if (p < 1 || p > this.pages()) return;
    this.updateQuery({ page: p });
  }

  new(): void {
    /* open dialog step 3 */
  }
  edit(_p: Product): void {
    /* open dialog step 3 */
  }
  del(p: Product): void {
    if (!confirm('Confirm delete?')) return; // sera remplacé par double confirmation à l’étape 3
    this.api.delete(p.id).subscribe(() => this.fetch());
  }
}
