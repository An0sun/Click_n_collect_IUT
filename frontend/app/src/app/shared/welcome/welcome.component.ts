import { Component, inject } from '@angular/core';
import { TokenService } from '../../../core/services/token.service';
import { Router } from '@angular/router';
import { GenericHomeComponent, HomeItem } from '../generic-home/generic-home.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  imports: [GenericHomeComponent],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
  private token = inject(TokenService);
  role = this.token.getRole();

  features: HomeItem[] = [
    { label: 'Shop', description: 'Shop of products', link: '/app/product-list', icon: '', roles: ['CLIENT'] },
  { label: 'Cart', description: 'Shop your cart', link: '/app/cart', icon: '', roles: ['CLIENT'] },

    { label: 'Products', description: 'Catalogs & stocks', link: '/admin/products', icon: '', roles: ['ADMIN'] },
    { label: 'Create product', description: 'Create product', link: '/admin/create-product', icon: '', roles: ['ADMIN'] },
    { label: 'Orders', description: 'Orders', link: '/orders', icon: '', roles: ['ADMIN', "CLIENT"] }

  ];
}
