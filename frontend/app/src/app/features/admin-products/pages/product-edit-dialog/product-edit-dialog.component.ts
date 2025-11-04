import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Product } from '../../../products/models/product.model';
import { ProductService } from '../../../admin-products/services/product.service';

type Mode = 'create' | 'edit';
interface DialogData {
  mode: Mode;
  product?: Product;
}

@Component({
  selector: 'app-product-edit-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  template: `
    <div class="p-6">
      <h2 mat-dialog-title class="text-2xl font-bold mb-6 text-center">
        {{ mode === 'create' ? 'Create product' : 'Edit product' }}
      </h2>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()" mat-dialog-content class="flex flex-col gap-4">
        <mat-form-field appearance="outline">
          <mat-label>Name</mat-label>
          <input 
            matInput 
            formControlName="name" 
            required 
            maxlength="120" 
            placeholder="Enter product name"
          />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <input
            matInput
            formControlName="description"
            required
            maxlength="255"
            placeholder="Enter product description"
          />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Category</mat-label>
          <mat-select formControlName="category" required>
            <mat-option value="Food">Food</mat-option>
            <mat-option value="Beverage">Beverage</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="grid grid-cols-2 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Price (€)</mat-label>
            <input
              matInput
              type="number"
              step="0.01"
              min="0"
              formControlName="price"
              required
              placeholder="0.00"
            />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Stock</mat-label>
            <input
              matInput
              type="number"
              step="1"
              min="0"
              formControlName="stock"
              required
              placeholder="0"
            />
          </mat-form-field>
        </div>
      </form>

      <div mat-dialog-actions class="flex justify-end gap-4 mt-6">
        <button 
          mat-stroked-button 
          (click)="close(false)"
          class="min-w-[100px] py-2"
        >
          Cancel
        </button>
        <button
          mat-flat-button
          color="primary"
          (click)="onSubmit()"
          [disabled]="form.invalid || busy()"
          class="min-w-[100px] py-2"
        >
          <span class="flex items-center justify-center gap-2">
            <span>{{ busy() ? 'Saving...' : 'Save' }}</span>
          </span>
        </button>
      </div>
    </div>
  `,

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductEditDialogComponent {
  private readonly ref = inject(
    MatDialogRef<ProductEditDialogComponent, boolean>
  );
  private readonly data = inject(MAT_DIALOG_DATA) as DialogData;
  private readonly svc = inject(ProductService);

  readonly mode: Mode = this.data.mode;
  readonly busy = signal(false);

  readonly form = new FormGroup({
    name: new FormControl<string>(this.data.product?.name ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(120)],
    }),
    description: new FormControl<string>(this.data.product?.description ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(255)],
    }),
    category: new FormControl<'Food' | 'Beverage'>(
      this.data.product?.category ?? 'Food',
      {
        nonNullable: true,
      }
    ),
    price: new FormControl<number>(this.data.product?.price ?? 0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    stock: new FormControl<number>(this.data.product?.stock ?? 0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.busy.set(true);

    const v = this.form.getRawValue();
    const payload = {
      name: v.name,
      description: v.description,
      category: v.category,
      price: Number(v.price),
      stock: Number(v.stock),
    } as Omit<Product, 'id'>;

    const req =
      this.mode === 'create'
        ? this.svc.create(payload)
        : this.svc.update(this.data.product!.id, payload);

    req.subscribe({
      next: () => {
        this.busy.set(false);
        this.close(true);
      },
      error: () => {
        this.busy.set(false);
      },
    });
  }

  close(ok: boolean) {
    this.ref.close(ok);
  }
}
