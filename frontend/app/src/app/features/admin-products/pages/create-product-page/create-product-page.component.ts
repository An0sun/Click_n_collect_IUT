import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Product } from '../../../products/models/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-admin-create-product-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: `
    <div class="min-h-screen bg-black/5" aria-label="Create product">
      <div class="max-w-2xl mx-auto p-6">
        <div
          class="bg-white rounded-xl shadow-lg p-6 border border-neutral-200"
        >
          <h1 class="text-2xl font-bold mb-6 text-center">Create Product</h1>

          <form
            [formGroup]="createProductForm"
            (ngSubmit)="onSubmit()"
            class="flex flex-col gap-4"
          >
            <mat-form-field appearance="outline">
              <mat-label>Name</mat-label>
              <input
                matInput
                formControlName="name"
                required
                placeholder="Enter product name"
              />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Description</mat-label>
              <input
                matInput
                formControlName="description"
                required
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

            <div class="flex justify-end gap-4 mt-6">
              <button
                mat-stroked-button
                type="button"
                (click)="router.navigate(['/admin/products'])"
                class="min-w-[100px] py-2"
              >
                Cancel
              </button>
              <button
                mat-flat-button
                color="primary"
                type="submit"
                [disabled]="createProductForm.invalid"
                class="min-w-[100px] py-2"
              >
                Create Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class AdminCreateProductPageComponent {
  constructor(
    private readonly productService: ProductService,
    public readonly router: Router
  ) {}

  createProductForm = new FormGroup({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(120),
      ],
    }),
    category: new FormControl<'Food' | 'Beverage'>('Food', {
      nonNullable: true,
    }),
    description: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(255),
      ],
    }),
    price: new FormControl<number>(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    stock: new FormControl<number>(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
  });

  onSubmit() {
    if (this.createProductForm.invalid) return;

    const v = this.createProductForm.getRawValue();
    const payload: Omit<Product, 'id'> = {
      name: v.name,
      description: v.description,
      category: v.category,
      price: Number(v.price),
      stock: Number(v.stock),
    };

    this.productService.create(payload).subscribe({
      next: () => this.router.navigate(['/admin/products']),
    });
  }
}
