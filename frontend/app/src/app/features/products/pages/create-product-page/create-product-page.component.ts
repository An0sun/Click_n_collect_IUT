import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-create-product-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-product-page.component.html',
  styleUrl: './create-product-page.component.scss'
})
export class CreateProductPageComponent {

  constructor(
    private readonly productService: ProductService,
    private readonly router: Router
  ) {}

  createProductForm = new FormGroup({
    name: new FormControl<string>('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),
    category: new FormControl<'Food'|'Beverage'|''>('Food', [Validators.required]), // défaut 'Food'
    description: new FormControl<string>('', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]),
    price: new FormControl<number | null>(0, [Validators.required, Validators.min(0)]),
    stock: new FormControl<number | null>(0, [Validators.required, Validators.min(0)]),
  });

  onSubmit() {
    if (this.createProductForm.invalid) return;

    const v = this.createProductForm.value as any;
    const payload: Omit<Product, 'id'> = {
      name: v.name,
      category: v.category,
      description: v.description,
      price: Number(v.price),
      stock: Number(v.stock),
    };

    this.productService.createProduct(payload).subscribe({
      complete: () => this.router.navigateByUrl('/welcome'),
    });
  }

  get name() { return this.createProductForm.get('name'); }
  get category() { return this.createProductForm.get('category'); }
  get description() { return this.createProductForm.get('description'); }
  get price() { return this.createProductForm.get('price'); }
  get stock() { return this.createProductForm.get('stock'); }
}
