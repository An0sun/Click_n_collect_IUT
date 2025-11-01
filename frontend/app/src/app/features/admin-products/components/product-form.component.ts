import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  Signal,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProductApi, Category, Product } from '../services/product.api';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <dialog
      #dlg
      aria-modal="true"
      aria-labelledby="product-dialog-title"
      aria-describedby="product-dialog-desc"
    >
      <form
        (submit)="onSubmit($event)"
        class="dialog-form"
        novalidate
        [attr.aria-busy]="pending() ? 'true' : 'false'"
      >
        <h3 id="product-dialog-title">{{ title() }}</h3>
        <p id="product-dialog-desc" class="visually-hidden">
          Fill the form and press Save to persist the product.
        </p>

        <!-- Name -->
        <label>
          Name
          <input
            #firstField
            name="name"
            [formControl]="form.controls.name"
            required
            [attr.aria-invalid]="
              form.controls.name.invalid && form.controls.name.touched
                ? 'true'
                : 'false'
            "
            [attr.aria-describedby]="
              form.controls.name.invalid && form.controls.name.touched
                ? 'err-name'
                : null
            "
          />
        </label>
        @if (form.controls.name.touched && form.controls.name.invalid) {
        <p id="err-name" class="error" role="alert">
          Name is required (max 120 chars).
        </p>
        }

        <!-- Description -->
        <label>
          Description
          <input
            name="description"
            [formControl]="form.controls.description"
            required
            [attr.aria-invalid]="
              form.controls.description.invalid &&
              form.controls.description.touched
                ? 'true'
                : 'false'
            "
            [attr.aria-describedby]="
              form.controls.description.invalid &&
              form.controls.description.touched
                ? 'err-desc'
                : null
            "
          />
        </label>
        @if (form.controls.description.touched &&
        form.controls.description.invalid) {
        <p id="err-desc" class="error" role="alert">
          Description is required (max 255 chars).
        </p>
        }

        <!-- Category -->
        <label>
          Category
          <select
            name="category"
            [formControl]="form.controls.category"
            required
          >
            <option value="Food">Food</option>
            <option value="Beverage">Beverage</option>
          </select>
        </label>

        <!-- Price -->
        <label>
          Price (€)
          <input
            type="number"
            step="0.01"
            inputmode="decimal"
            [formControl]="form.controls.price"
            required
            [attr.aria-invalid]="
              form.controls.price.invalid && form.controls.price.touched
                ? 'true'
                : 'false'
            "
            [attr.aria-describedby]="
              form.controls.price.invalid && form.controls.price.touched
                ? 'err-price'
                : null
            "
          />
        </label>
        @if (form.controls.price.touched && form.controls.price.invalid) {
        <p id="err-price" class="error" role="alert">
          Price must be a number ≥ 0.
        </p>
        }

        <!-- Stock -->
        <label>
          Stock
          <input
            type="number"
            inputmode="numeric"
            [formControl]="form.controls.stock"
            required
            [attr.aria-invalid]="
              form.controls.stock.invalid && form.controls.stock.touched
                ? 'true'
                : 'false'
            "
            [attr.aria-describedby]="
              form.controls.stock.invalid && form.controls.stock.touched
                ? 'err-stock'
                : null
            "
          />
        </label>
        @if (form.controls.stock.touched && form.controls.stock.invalid) {
        <p id="err-stock" class="error" role="alert">
          Stock must be an integer ≥ 0.
        </p>
        }

        <!-- Global error (API) -->
        @if (apiError()) {
        <p class="error" role="alert">{{ apiError() }}</p>
        }

        <div class="actions">
          <button
            type="button"
            class="btn"
            (click)="close()"
            [disabled]="pending()"
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn primary"
            [disabled]="form.invalid || pending()"
            aria-label="Save"
          >
            @if (!pending()) { Save } @else { Saving… }
          </button>
        </div>
      </form>
    </dialog>
  `,
  styles: [
    `
      dialog {
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 16px;
      }
      .dialog-form {
        display: grid;
        gap: 12px;
        min-width: 360px;
      }
      label {
        display: grid;
        gap: 4px;
      }
      input,
      select {
        padding: 6px 8px;
      }
      .actions {
        display: flex;
        justify-content: end;
        gap: 8px;
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
      .error {
        color: #8a0000;
        font-size: 0.95rem;
      }
      .visually-hidden {
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
export class ProductFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ProductApi);

  dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');
  firstField = viewChild<ElementRef<HTMLInputElement>>('firstField');

  readonly editing = signal<Product | null>(null);
  readonly pending = signal(false);
  readonly apiError = signal<string | null>(null);
  readonly title: Signal<string> = computed(() =>
    this.editing() ? 'Edit product' : 'New product'
  );

  @Output() closed = new EventEmitter<boolean>();

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.required, Validators.maxLength(255)]],
    category: ['Food' as Category, [Validators.required]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
  });

  private focusFirstInput(): void {
    queueMicrotask(() => this.firstField()?.nativeElement.focus());
  }

  openCreate(): void {
    this.apiError.set(null);
    this.editing.set(null);
    this.form.reset({
      name: '',
      description: '',
      category: 'Food',
      price: 0,
      stock: 0,
    });
    this.dlg().nativeElement.showModal();
    this.focusFirstInput();
  }

  openEdit(p: Product): void {
    this.apiError.set(null);
    this.editing.set(p);
    this.form.setValue({
      name: p.name,
      description: p.description,
      category: p.category,
      price: p.price,
      stock: p.stock,
    });
    this.dlg().nativeElement.showModal();
    this.focusFirstInput();
  }

  close(saved = false): void {
    this.dlg().nativeElement.close();
    this.closed.emit(saved);
  }

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    this.apiError.set(null);

    if (this.form.invalid || this.pending()) {
      this.form.markAllAsTouched();
      return;
    }

    this.pending.set(true);
    const payload = {
      ...this.form.getRawValue(),
      price: Number(this.form.controls.price.value ?? 0),
      stock: Number(this.form.controls.stock.value ?? 0),
    };

    const editing = this.editing();

    if (editing) {
      this.api.update(editing.id, payload).subscribe({
        next: () => {
          this.pending.set(false);
          this.close(true);
        },
        error: (err: unknown) => {
          this.pending.set(false);
          this.apiError.set('Save failed. Please try again.');
          console.error(err);
        },
      });
    } else {
      this.api.create(payload).subscribe({
        next: () => {
          this.pending.set(false);
          this.close(true);
        },
        error: (err: unknown) => {
          this.pending.set(false);
          this.apiError.set('Save failed. Please try again.');
          console.error(err);
        },
      });
    }
  }
}
