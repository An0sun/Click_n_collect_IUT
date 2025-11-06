import { Routes } from '@angular/router';
import { RoleGuard } from '../core/guards/role.guard';
import { ProductListComponent } from './features/products/pages/product-list/product-list.component';
import { CreateProductPageComponent } from './features/products/pages/create-product-page/create-product-page.component';
import { CartPageComponent } from './features/cart/pages/cart-page/cart-page.component';
import { LoginComponent } from './features/authentification/pages/login/login.component';
import { RegisterComponent } from './features/authentification/pages/register/register.component';
import { LogoutComponent } from './features/authentification/components/logout/logout.component';
import { OrdersPageComponent } from './features/orders/pages/orders-page/orders-page.component';
import { AdminProductsPageComponent } from './features/products/pages/admin-products-page/admin-products-page.component';
import { guestGuard, landingGuard } from '../core/guards/guest.guard';
import { OrderSummary } from './features/orders/components/orders-summary/order-summary.component';

export const routes: Routes = [
  { path: '', component: LoginComponent, canMatch: [landingGuard] },

  { path: 'auth/login', component: LoginComponent, canMatch: [guestGuard] },
  { path: 'auth/register', component: RegisterComponent, canMatch: [guestGuard] },
  { path: 'auth/logout', component: LogoutComponent },

  {
    path: 'app',
    canMatch: [RoleGuard],
    data: { roles: ['CLIENT'] },
    children: [
      { path: 'product-list', component: ProductListComponent },
      { path: 'cart', component: CartPageComponent },
      { path: 'orders', component: OrdersPageComponent },
      { path: '', pathMatch: 'full', redirectTo: 'product-list' },
      { path: 'order-summary', component: OrderSummary },
    ],
  },

  {
    path: 'admin',
    canMatch: [RoleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: 'create-product', component: CreateProductPageComponent },
      { path: 'products', component: AdminProductsPageComponent },
      { path: 'orders', component: OrdersPageComponent },
      { path: '', pathMatch: 'full', redirectTo: 'products' },
    ],
  },

  { path: '**', redirectTo: '' },
];
