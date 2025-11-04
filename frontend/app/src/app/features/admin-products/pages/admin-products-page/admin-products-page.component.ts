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
    <section class="max-w-6xl mx-auto p-4" aria-label="Products management">
      <header
        class="flex flex-col sm:flex-row gap-3 sm:items-center mb-4"
        role="search"
      >
        <mat-form-field appearance="outline" class="w-full sm:w-1/3">
          <mat-label>Search</mat-label>
          <input
            matInput
            [formControl]="qCtrl"
            placeholder="name or description"
            inputmode="search"
            aria-label="Search product"
          />
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full sm:w-1/6">
          <mat-label>Category</mat-label>
          <mat-select [formControl]="categoryCtrl" aria-label="Category filter">
            <mat-option [value]="''">All</mat-option>
            <mat-option value="Food">Food</mat-option>
            <mat-option value="Beverage">Beverage</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="flex-1"></div>

        <button
          mat-raised-button
          color="primary"
          (click)="openCreate()"
          [attr.aria-label]="'Create product'"
          class="ml-auto"
        >
          <mat-icon aria-hidden="true">add</mat-icon>
          <span class="ml-2">Create</span>
        </button>
      </header>

      <div
        class="overflow-auto rounded-lg bg-white shadow"
        role="region"
        aria-live="polite"
        aria-label="Products table"
      >
        <table
          mat-table
          [dataSource]="items()"
          class="mat-elevation-z1 w-full border-collapse"
          [trackBy]="trackById"
        >
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef class="w-[35%] px-4">
              <button
                class="inline-flex items-center gap-1 font-semibold cursor-pointer"
                (click)="toggleSort('name')"
                [attr.aria-sort]="ariaSort('name')"
              >
                Name
                <mat-icon fontIcon="unfold_more" aria-hidden="true"></mat-icon>
              </button>
            </th>
            <td mat-cell *matCellDef="let p" class="px-4">
              <div class="truncate" [title]="p.name">{{ p.name }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef class="w-[20%] px-4">
              Category
            </th>
            <td mat-cell *matCellDef="let p" class="px-4">{{ p.category }}</td>
          </ng-container>

          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef class="w-[15%] px-4">
              <button
                class="inline-flex items-center gap-1 font-semibold cursor-pointer"
                (click)="toggleSort('price')"
                [attr.aria-sort]="ariaSort('price')"
              >
                Price
                <mat-icon fontIcon="unfold_more" aria-hidden="true"></mat-icon>
              </button>
            </th>
            <td mat-cell *matCellDef="let p" class="px-4">
              {{ p.price | number : '1.2-2' }} €
            </td>
          </ng-container>

          <ng-container matColumnDef="stock">
            <th mat-header-cell *matHeaderCellDef class="w-[15%] px-4">
              <button
                class="inline-flex items-center gap-1 font-semibold cursor-pointer"
                (click)="toggleSort('stock')"
                [attr.aria-sort]="ariaSort('stock')"
              >
                Stock
                <mat-icon fontIcon="unfold_more" aria-hidden="true"></mat-icon>
              </button>
            </th>
            <td mat-cell *matCellDef="let p" class="px-4">{{ p.stock }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="w-[15%] px-4">
              Actions
            </th>
            <td mat-cell *matCellDef="let p" class="px-4 whitespace-nowrap">
              <button
                mat-icon-button
                color="primary"
                (click)="openEdit(p)"
                [attr.aria-label]="'Edit ' + p.name"
              >
                <mat-icon>edit</mat-icon>
              </button>
              <button
                mat-icon-button
                color="warn"
                (click)="confirmDelete(p)"
                [attr.aria-label]="'Delete ' + p.name"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr
            mat-header-row
            *matHeaderRowDef="displayedColumns"
            class="bg-gray-50"
          ></tr>
          <tr
            mat-row
            *matRowDef="let row; columns: displayedColumns"
            class="hover:bg-gray-50 transition-colors border-t border-gray-100"
          ></tr>
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
      <p class="mt-3 text-gray-700" role="status" aria-live="polite">
        Loading…
      </p>
      } @if (error()) {
      <p class="mt-3 text-red-600" role="alert">{{ error() }}</p>
      }
    </section>
  `,
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
