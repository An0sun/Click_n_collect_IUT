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
      <app-product-table />
    </section>
  `,
  styles: [
    `
      .container {
        padding: 24px;
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
}
