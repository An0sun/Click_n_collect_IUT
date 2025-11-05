import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthState } from '../services/auth-state.service';

export const guestGuard: CanMatchFn = () => {
  const auth = inject(AuthState);
  const router = inject(Router);
  if (auth.isLoggedIn) {
    const url = auth.role === 'ADMIN' ? '/admin/products' : '/app/products';
    return router.parseUrl(url);
  }
  return true;
};

export const landingGuard: CanMatchFn = () => {
  const auth = inject(AuthState);
  const router = inject(Router);
  if (!auth.isLoggedIn) return true;
  return router.parseUrl(auth.role === 'ADMIN' ? '/admin/products' : '/app/products');
};
