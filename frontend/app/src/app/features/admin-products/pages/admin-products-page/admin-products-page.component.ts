import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ProductService, ProductPage } from '../../services/product.service';
import { Product } from '../../../products/models/product.model';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { ConfirmDialogComponent } from '../../components/confirm-dialog.component';
import { ProductEditDialogComponent } from '../product-edit-dialog/product-edit-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type SortKey = 'name' | 'price' | 'stock';
type SortDir = 'asc' | 'desc';
type SortParam = `${SortKey}_${SortDir}`;

@Component({
  selector: 'app-admin-products-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatDialogModule,
  ],
  template: `
    <section class="container" aria-label="Products management">
      <header class="toolbar" role="search">
        <mat-form-field appearance="outline">
          <mat-label>Search</mat-label>
          <input
            matInput
            [formControl]="qCtrl"
            placeholder="name or description"
            inputmode="search"
            aria-label="Search product"
          />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Category</mat-label>
          <mat-select [formControl]="categoryCtrl" aria-label="Category filter">
            <mat-option [value]="''">All</mat-option>
            <mat-option value="Food">Food</mat-option>
            <mat-option value="Beverage">Beverage</mat-option>
          </mat-select>
        </mat-form-field>

        <span class="spacer" aria-hidden="true"></span>

        <button
          mat-raised-button
          color="primary"
          (click)="openCreate()"
          aria-label="Create product"
        >
          <mat-icon aria-hidden="true">add</mat-icon> Create
        </button>
      </header>

      <div
        class="table-wrap"
        role="region"
        aria-live="polite"
        aria-label="Products table"
      >
        <table
          mat-table
          [dataSource]="items()"
          class="mat-elevation-z1"
          [trackBy]="trackById"
        >
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>
              <button
                class="th-btn"
                (click)="toggleSort('name')"
                [attr.aria-sort]="ariaSort('name')"
              >
                Name
                <mat-icon fontIcon="unfold_more" aria-hidden="true"></mat-icon>
              </button>
            </th>
            <td mat-cell *matCellDef="let p">{{ p.name }}</td>
          </ng-container>

          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef>Category</th>
            <td mat-cell *matCellDef="let p">{{ p.category }}</td>
          </ng-container>

          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef>
              <button
                class="th-btn"
                (click)="toggleSort('price')"
                [attr.aria-sort]="ariaSort('price')"
              >
                Price
                <mat-icon fontIcon="unfold_more" aria-hidden="true"></mat-icon>
              </button>
            </th>
            <td mat-cell *matCellDef="let p">
              {{ p.price | number : '1.2-2' }} €
            </td>
          </ng-container>

          <ng-container matColumnDef="stock">
            <th mat-header-cell *matHeaderCellDef>
              <button
                class="th-btn"
                (click)="toggleSort('stock')"
                [attr.aria-sort]="ariaSort('stock')"
              >
                Stock
                <mat-icon fontIcon="unfold_more" aria-hidden="true"></mat-icon>
              </button>
            </th>
            <td mat-cell *matCellDef="let p">{{ p.stock }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let p">
              <button
                mat-icon-button
                color="primary"
                (click)="openEdit(p)"
                aria-label="Edit {{ p.name }}"
              >
                <mat-icon>edit</mat-icon>
              </button>
              <button
                mat-icon-button
                color="warn"
                (click)="confirmDelete(p)"
                aria-label="Delete {{ p.name }}"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
      </div>

      <mat-paginator
        [length]="total()"
        [pageIndex]="page() - 1"
        [pageSize]="perPage()"
        [pageSizeOptions]="[10, 20, 50, 100]"
        (page)="onPage($event)"
        aria-label="Products pagination"
      >
      </mat-paginator>

      @if (loading()) {
      <p class="loading" role="status" aria-live="polite">Loading…</p>
      } @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
      }
    </section>
  `,
  styles: [
    `
      .container {
        max-width: 1200px;
        margin: 24px auto;
        padding: 0 16px;
      }
      .toolbar {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 12px;
      }
      .spacer {
        flex: 1 1 auto;
      }
      .table-wrap {
        overflow: auto;
        border-radius: 8px;
        background: #fff;
      }
      .th-btn {
        all: unset;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-weight: 600;
      }
      .loading {
        margin-top: 12px;
        color: #374151;
      }
      .error {
        margin-top: 12px;
        color: #b91c1c;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductsPageComponent {
  private readonly svc = inject(ProductService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly qCtrl = new FormControl<string>('', { nonNullable: true });
  readonly categoryCtrl = new FormControl<'' | 'Food' | 'Beverage'>('', {
    nonNullable: true,
  });

  private readonly sortKey = signal<SortKey>('name');
  private readonly sortDir = signal<SortDir>('asc');
  readonly page = signal<number>(1);
  readonly perPage = signal<number>(20);

  private readonly _items = signal<Product[]>([]);
  private readonly _total = signal<number>(0);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly items = computed(() => this._items());
  readonly total = computed(() => this._total());
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());
  readonly displayedColumns = [
    'name',
    'category',
    'price',
    'stock',
    'actions',
  ] as const;

  constructor() {
    this.qCtrl.valueChanges
      .pipe(
        startWith(this.qCtrl.value),
        debounceTime(250),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.loadPage(1));

    this.categoryCtrl.valueChanges
      .pipe(
        startWith(this.categoryCtrl.value),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.loadPage(1));
  }

  trackById = (_: number, p: Product) => p.id;

  ariaSort(key: SortKey): 'ascending' | 'descending' | undefined {
    if (this.sortKey() !== key) return undefined;
    return this.sortDir() === 'asc' ? 'ascending' : 'descending';
  }

  toggleSort(key: SortKey) {
    if (this.sortKey() === key)
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
    this.loadPage(1);
  }

  onPage(e: PageEvent) {
    this.perPage.set(e.pageSize);
    this.page.set(e.pageIndex + 1);
    this.loadPage(this.page());
  }

  loadPage(pg: number) {
    this._loading.set(true);
    this._error.set(null);
    const sort: SortParam = `${this.sortKey()}_${this.sortDir()}`;

    this.svc
      .listPage({
        q: this.qCtrl.value?.trim() || undefined,
        category: this.categoryCtrl.value || undefined,
        sort,
        page: pg,
        per_page: this.perPage(),
      })
      .subscribe({
        next: (res: ProductPage) => {
          this._items.set(res.items);
          this._total.set(res.total);
          this.page.set(res.page);
          this._loading.set(false);
        },
        error: () => {
          this._loading.set(false);
          this._error.set('Failed to load products');
        },
      });
  }

  openCreate() {
    const ref = this.dialog.open(ProductEditDialogComponent, {
      width: '520px',
      data: { mode: 'create' },
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) this.loadPage(this.page());
    });
  }

  openEdit(p: Product) {
    const ref = this.dialog.open(ProductEditDialogComponent, {
      width: '520px',
      data: { mode: 'edit', product: p },
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) this.loadPage(this.page());
    });
  }

  confirmDelete(p: Product) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: { title: 'Delete', message: `Delete “${p.name}”?` },
    });
    ref.afterClosed().subscribe((ok) => {
      if (!ok) return;
      this._loading.set(true);
      this.svc.delete(p.id).subscribe({
        next: () => this.loadPage(this.page()),
        error: () => {
          this._loading.set(false);
          this._error.set('Delete failed');
        },
      });
    });
  }
}
