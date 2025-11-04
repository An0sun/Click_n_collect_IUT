import { Routes } from '@angular/router';
import { AdminProductsPageComponent } from './pages/admin-products-page/admin-products-page.component';

export const ADMIN_PRODUCT_ROUTES: Routes = [
  {
    path: '',
    component: AdminProductsPageComponent,
    title: 'Admin • Products',
  },
];
