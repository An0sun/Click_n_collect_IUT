import { Routes } from '@angular/router';
import { CustomerCardComponent } from './features/products/pages/customer-card/customer-card.component';
import { CreateProductPageComponent } from './features/products/pages/create-product-page/create-product-page.component';

export const routes: Routes = [
    {
        path: '', component: CustomerCardComponent
    },
    {
        path: 'create-product', component: CreateProductPageComponent
    }
];
