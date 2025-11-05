import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-create-product-page',
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
    category: new FormControl<'Food'|'Beverage'|''>('', [Validators.required]), 
    description: new FormControl<string>('', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]),
    price: new FormControl<number | null>(null, [Validators.required]),
    stock: new FormControl<number | null>(null, [Validators.required]),
    imageUrl: new FormControl<string | null>(null, [Validators.pattern(/^https?:\/\//i)])
  });

  
  submitting = false;

  onSubmit() {
    if (this.createProductForm.invalid) {
      this.createProductForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.productService.createProduct(this.createProductForm.value as Omit<Product, 'id'>).subscribe({
      next: () => {
        alert('Produit créé avec succès');
        this.router.navigateByUrl('/admin/products');
      },
      error: (err) => {
        console.error(err);
        alert("Erreur lors de la création du produit.");
        this.submitting = false;
      }
    });
  }
  
  
  get name() { return this.createProductForm.get('name'); }
  get category() { return this.createProductForm.get('category'); }
  get description() { return this.createProductForm.get('description'); }
  get price() { return this.createProductForm.get('price'); }
  get stock() { return this.createProductForm.get('stock'); }
  get imageUrl() { return this.createProductForm.get('imageUrl'); }
}
