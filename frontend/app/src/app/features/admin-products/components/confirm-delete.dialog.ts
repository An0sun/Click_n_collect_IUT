import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { ProductApi, Product } from '../services/product.api';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirm-delete',
  standalone: true,
  imports: [FormsModule],
  template: `
    <dialog aria-modal="true" aria-labelledby="delete-title">
      <section>
        <h3 id="delete-title">Delete product</h3>

        @if (step() === 1) {
        <p>Are you sure you want to delete this product?</p>
        <div class="actions">
          <button type="button" (click)="close()">Cancel</button>
          <button type="button" class="danger" (click)="next()">
            Continue
          </button>
        </div>
        } @if (step() === 2) {
        <p>This action will remove the product from listings.</p>
        <label>
          <input
            type="checkbox"
            [checked]="confirmChecked()"
            (change)="onToggle($event)"
          />
          I confirm
        </label>
        <div class="actions">
          <button type="button" (click)="back()">Back</button>
          <button
            type="button"
            class="danger"
            [disabled]="!confirmChecked()"
            (click)="perform()"
          >
            Delete
          </button>
        </div>
        }
      </section>
    </dialog>
  `,
  styles: [
    `
      dialog {
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 16px;
        min-width: 320px;
      }
      .actions {
        display: flex;
        gap: 8px;
        justify-content: end;
        margin-top: 12px;
      }
      .danger {
        border: 1px solid #a00;
        background: transparent;
        cursor: pointer;
        padding: 6px 10px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class ConfirmDeleteDialogComponent {
  private readonly host = inject(ElementRef<HTMLDialogElement>);
  private readonly api = inject(ProductApi);

  readonly target = signal<Product | null>(null);
  readonly step = signal<1 | 2>(1);
  readonly confirmChecked = signal(false);

  show(p: Product): void {
    this.target.set(p);
    this.step.set(1);
    this.confirmChecked.set(false);
    this.host.nativeElement.showModal();
  }

  close(): void {
    this.host.nativeElement.close();
  }
  back(): void {
    this.step.set(1);
    this.confirmChecked.set(false);
  }
  next(): void {
    this.step.set(2);
  }
  onToggle(e: Event): void {
    this.confirmChecked.set((e.target as HTMLInputElement).checked);
  }

  perform(): void {
    const p = this.target();
    if (!p) return;
    this.api.delete(p.id).subscribe(() => this.close());
  }
}
