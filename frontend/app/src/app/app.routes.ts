import { Routes } from '@angular/router';
import { RoleGuard } from '../core/guards/role.guard';
import { HomeComponent } from './shared/home/home.component';
import { WelcomeComponent } from './shared/welcome/welcome.component';
import { ProductListComponent } from './features/products/pages/product-list/product-list.component';
import { CreateProductPageComponent } from './features/products/pages/create-product-page/create-product-page.component';
import { CartPageComponent } from './features/cart/pages/cart-page/cart-page.component';
import { OrderSummary } from './features/orders/components/orders-summary/order-summary.component';

import { LoginComponent } from './features/authentification/pages/login/login.component';
import { RegisterComponent } from './features/authentification/pages/register/register.component';
import { LogoutComponent } from './features/authentification/components/logout/logout.component';
import { OrdersPageComponent } from './features/orders/pages/orders-page/orders-page.component';
export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'auth/login',
    component: LoginComponent,
  },
  {
    path: 'auth/register',
    component: RegisterComponent,
  },
  {
    path: 'auth/logout',
    component: LogoutComponent,
  },

  {
    path: 'orders',
    component: OrdersPageComponent,
  },

  {
    path: 'welcome',
    canMatch: [RoleGuard],
    data: { roles: ['CLIENT', 'ADMIN'] },
    component: WelcomeComponent,
  },

  {
    path: 'app',
    canMatch: [RoleGuard],
    data: { roles: ['CLIENT', 'ADMIN'] },
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: WelcomeComponent,
      },
      {
        path: 'product-list',
        component: ProductListComponent,
      },
      {
        path: 'cart',
        component: CartPageComponent,
      },
      {
        path: 'orders',
        component: OrderSummary,
      },
    ],
  },

  {
    path: 'admin',
    canMatch: [RoleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: WelcomeComponent,
      },
      {
        path: 'create-product',
        component: CreateProductPageComponent,
      },
    ],
  },

  {
    path: 'admin/products',
    loadChildren: () =>
      import('./features/admin-products/admin-product.routes').then(
        (m) => m.ADMIN_PRODUCT_ROUTES
      ),
  },

  { path: '**', redirectTo: '' },
];
