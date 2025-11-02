import { Component } from '@angular/core';
import { Order } from '../../models/order.model';
import { OrderService } from '../../services/order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent {
  order: Order | null = null;

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    this.order = nav?.extras?.state?.['order'] ?? null;
  }

  ngOnInit() {
    if (!this.order) {
      console.warn('No order data found — redirecting to product list.');
      this.router.navigate(['/app/product-list']);
    }
  }

  goToProducts() {
    this.router.navigate(['/app/product-list']);
  }

}
