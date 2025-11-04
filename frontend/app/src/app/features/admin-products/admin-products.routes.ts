import { Routes } from '@angular/router';
import { AdminProductsPageComponent } from './pages/admin-products-page/admin-products-page.component';

export const ADMIN_PRODUCT_ROUTES: Routes = [
  {
    path: '',
    component: AdminProductsPageComponent,
    title: 'Admin • Products',
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/create-product-page/create-product-page.component').then(
        (m) => m.AdminCreateProductPageComponent
      ),
    title: 'Admin • Create Product',
  },
];
