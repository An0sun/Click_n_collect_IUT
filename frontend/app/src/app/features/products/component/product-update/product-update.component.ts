import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';


@Component({
  selector: 'app-product-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-update.component.html',
})
export class ProductUpdateComponent implements OnInit {
  @Input() product!: Product;
  @Output() saved = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  saving = false;
  form!: FormGroup;

  constructor(private fb: FormBuilder, private svc: ProductService) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      category: ['Food', [Validators.required]],
      description: ['', [Validators.required, Validators.maxLength(255)]],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      imageUrl: [null, [Validators.pattern(/^https?:\/\//i)]]
    });

    if (this.product) {
      this.form.patchValue({
        name: this.product.name,
        category: this.product.category as 'Food' | 'Beverage',
        description: this.product.description,
        price: this.product.price,
        stock: this.product.stock,
        imageUrl: this.product.imageUrl ?? null,
      });
    }
  }

  submit() {
    if (this.form.invalid || !this.product) return;

    const raw = this.form.getRawValue();
    const patch: Partial<Product> = {};
    (['name','category','description','price','stock','imageUrl'] as const).forEach((k) => {
      if ((this.product as any)[k] !== (raw as any)[k]) {
        (patch as any)[k] = (raw as any)[k];
      }
    });

    if (Object.keys(patch).length === 0) {
      this.cancel.emit();
      return;
    }

    this.saving = true;
    this.svc.updateProduct(this.product.id, patch).subscribe({
      next: () => { this.saving = false; this.saved.emit(); },
    });
  }
}
