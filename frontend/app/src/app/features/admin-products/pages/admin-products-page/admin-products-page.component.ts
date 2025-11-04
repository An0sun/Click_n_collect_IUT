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
import { Router } from '@angular/router';

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
    <section class="min-h-screen bg-black/5" aria-label="Products management">
      <div class="max-w-7xl mx-auto p-6">
        <div
          class="bg-white rounded-xl shadow-lg p-6 border border-neutral-200"
        >
          <header
            class="flex flex-col sm:flex-row gap-4 sm:items-center mb-6"
            role="search"
          >
            <mat-form-field appearance="outline" class="w-full sm:w-1/3">
              <mat-label>Search</mat-label>
              <!-- spacing to avoid overlap between prefix icon and input text -->
              <mat-icon matPrefix class="mr-2 ml-1">search</mat-icon>
              <input
                matInput
                [formControl]="qCtrl"
                placeholder="Search products..."
                inputmode="search"
                aria-label="Search product"
                class="pl-6"
              />
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full sm:w-1/6">
              <mat-label>Category</mat-label>
              <mat-icon matPrefix class="mr-2 ml-1">category</mat-icon>
              <!-- add a custom panel class so we can force a white background for the overlay -->
              <mat-select
                [formControl]="categoryCtrl"
                aria-label="Category filter"
                class="pl-4"
                [panelClass]="'category-panel'"
              >
                <mat-option [value]="''">All</mat-option>
                <mat-option value="Food">Food</mat-option>
                <mat-option value="Beverage">Beverage</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="flex-1"></div>

            <button
              mat-flat-button
              color="warn"
              (click)="openCreate()"
              class="!min-w-[120px] !h-[45px] shadow-md hover:shadow-lg transition-all"
            >
              <mat-icon class="mr-2">add_circle</mat-icon>
              <span>Create</span>
            </button>
          </header>

          <div
            class="overflow-x-auto rounded-lg border border-neutral-200"
            role="region"
            aria-live="polite"
          >
            <table
              mat-table
              [dataSource]="items()"
              class="min-w-full"
              [trackBy]="trackById"
            >
              <ng-container matColumnDef="name">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                  class="w-[35%] !px-6 font-bold text-sm"
                  style="background:#0f172a; color:#fff;"
                >
                  <button
                    class="inline-flex items-center gap-2 font-medium"
                    (click)="toggleSort('name')"
                  >
                    Name
                    <mat-icon class="!w-5 !h-5 !text-base"
                      >unfold_more</mat-icon
                    >
                  </button>
                </th>
                <td mat-cell *matCellDef="let p" class="!px-6 !py-4">
                  <div class="truncate font-medium" [title]="p.name">
                    {{ p.name }}
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="category">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                  class="w-[20%] !px-6 font-bold text-sm"
                  style="background:#0f172a; color:#fff;"
                >
                  Category
                </th>
                <td mat-cell *matCellDef="let p" class="!px-6 !py-4">
                  {{ p.category }}
                </td>
              </ng-container>

              <ng-container matColumnDef="price">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                  class="w-[15%] !px-6 font-bold text-sm"
                  style="background:#0f172a; color:#fff;"
                >
                  <button
                    class="inline-flex items-center gap-2 font-medium"
                    (click)="toggleSort('price')"
                  >
                    Price
                    <mat-icon class="!w-5 !h-5 !text-base"
                      >unfold_more</mat-icon
                    >
                  </button>
                </th>
                <td mat-cell *matCellDef="let p" class="!px-6 !py-4">
                  {{ p.price | number : '1.2-2' }} €
                </td>
              </ng-container>

              <ng-container matColumnDef="stock">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                  class="w-[15%] !px-6 font-bold text-sm"
                  style="background:#0f172a; color:#fff;"
                >
                  <button
                    class="inline-flex items-center gap-2 font-medium"
                    (click)="toggleSort('stock')"
                  >
                    Stock
                    <mat-icon class="!w-5 !h-5 !text-base"
                      >unfold_more</mat-icon
                    >
                  </button>
                </th>
                <td mat-cell *matCellDef="let p" class="!px-6 !py-4">
                  {{ p.stock }}
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                  class="w-[15%] !px-6 font-bold text-sm"
                  style="background:#0f172a; color:#fff;"
                >
                  Actions
                </th>
                <td mat-cell *matCellDef="let p" class="!px-6 !py-4">
                  <div class="flex gap-2">
                    <button
                      mat-icon-button
                      color="primary"
                      (click)="openEdit(p)"
                      class="!w-8 !h-8"
                    >
                      <mat-icon class="!w-5 !h-5 !text-base">edit</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      color="warn"
                      (click)="confirmDelete(p)"
                      class="!w-8 !h-8"
                    >
                      <mat-icon class="!w-5 !h-5 !text-base">delete</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr
                mat-row
                *matRowDef="let row; columns: displayedColumns"
                class="hover:bg-neutral-50 transition-colors border-t border-neutral-200"
              ></tr>
            </table>
          </div>

          <div
            class="mt-4 flex items-center justify-center bg-white border border-neutral-200 rounded-lg overflow-hidden px-6 py-3"
          >
            <mat-paginator
              class="admin-products-paginator"
              [length]="total()"
              [pageIndex]="page() - 1"
              [pageSize]="perPage()"
              [pageSizeOptions]="[5, 10, 20, 50, 100]"
              [showFirstLastButtons]="true"
              (page)="onPage($event)"
              aria-label="Products pagination"
            >
            </mat-paginator>
          </div>

          @if (loading()) {
          <div class="mt-4 flex items-center justify-center text-neutral-600">
            <mat-icon class="animate-spin mr-2">refresh</mat-icon>
            <span>Loading...</span>
          </div>
          } @if (error()) {
          <div
            class="mt-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 flex items-center"
          >
            <mat-icon class="mr-2">error</mat-icon>
            <span>{{ error() }}</span>
          </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      /* Ensure the mat-select options panel is solid white and above other content */
      ::ng-deep .category-panel {
        background: #ffffff !important;
        color: #111 !important;
        z-index: 3000 !important;
      }

      /* Make sure mat-options are also on white background */
      .category-panel .mat-option {
        background: #ffffff !important;
        color: #111 !important;
      }

      /* Center paginator content inside its container */
      :host ::ng-deep .admin-products-paginator {
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        width: 100%;
      }

      /* Slight spacing for the page-size selector */
      :host ::ng-deep .admin-products-paginator .mat-paginator-page-size {
        margin-right: 1rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductsPageComponent {
  private readonly svc = inject(ProductService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

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
    const newPage = e.pageIndex + 1;
    const newPerPage = e.pageSize;

    if (this.perPage() === newPerPage) {
      // same page size: just change page
      this.page.set(newPage);
      this.loadPage(newPage);
    } else {
      // different page size: reset to first page with new page size
      this.perPage.set(newPerPage);
      this.page.set(1);
      this.loadPage(1);
    }
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
    this.router.navigate(['/admin/create-product']);
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
