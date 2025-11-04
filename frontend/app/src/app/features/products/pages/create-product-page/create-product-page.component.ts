import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Product } from '../../models/product.model';
import { ProductService } from '../../../admin-products/services/product.service';

@Component({
  selector: 'app-create-product-page',
  imports: [ReactiveFormsModule],
  templateUrl: './create-product-page.component.html',
  styleUrl: './create-product-page.component.scss',
})
export class CreateProductPageComponent {
  constructor(
    private readonly productService: ProductService,
    private readonly router: Router
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
      complete: () => this.router.navigateByUrl('/welcome'),
    });
  }

  get name() {
    return this.createProductForm.get('name');
  }
  get category() {
    return this.createProductForm.get('category');
  }
  get description() {
    return this.createProductForm.get('description');
  }
  get price() {
    return this.createProductForm.get('price');
  }
  get stock() {
    return this.createProductForm.get('stock');
  }
}
