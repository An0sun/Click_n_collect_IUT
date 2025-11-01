import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { ProductTableComponent } from '../components/product-table.component';

@Component({
  selector: 'app-products-admin-page',
  standalone: true,
  imports: [ProductTableComponent],
  template: `
    <section class="container" role="region" aria-label="Product management">
      <h1 class="sr-only">Products</h1>

      <header class="toolbar" role="toolbar" aria-label="Actions">
        <button
          type="button"
          class="btn primary"
          (click)="openCreate()"
          aria-label="Add product"
        >
          + Add product
        </button>
      </header>

      <div role="status" aria-live="polite" class="hint">
        Admin panel loaded. Table and filters will appear next.
      </div>
      <app-product-table />
    </section>
  `,
  styles: [
    `
      .container {
        padding: 24px;
      }
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
      .hint {
        color: #2e2e2e;
      }
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        border: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class ProductsAdminPage {
  readonly creating = signal(false);
  readonly title = computed(() =>
    this.creating() ? 'New product' : 'Products'
  );

  openCreate(): void {
    this.creating.set(true);
  }
}
