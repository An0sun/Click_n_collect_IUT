import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Order } from '../../models/orders.model';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.scss'
})
export class OrderSummary {
  order: Order | null = null;

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    this.order = nav?.extras?.state?.['order'] ?? null;
  }

  ngOnInit() {
    if (!this.order) {
      this.router.navigate(['/app/product-list']);
    }
  }

  goToProducts() {
    this.router.navigate(['/app/product-list']);
  }

}
