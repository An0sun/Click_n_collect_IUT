import { Routes } from '@angular/router';
import { ProductListComponent } from './features/products/pages/product-list/product-list.component';
import { CreateProductPageComponent } from './features/products/pages/create-product-page/create-product-page.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'product-list',
        pathMatch: 'full'
    },
    {
        path: 'product-list', component: ProductListComponent
    },
    {
        path: 'create-product', component: CreateProductPageComponent
    }
]
