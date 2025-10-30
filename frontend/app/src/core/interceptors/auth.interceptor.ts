import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TokenService } from '../services/token.service';
import { of } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);
  const isApi = req.url.startsWith('http://localhost:5000/');

  if (!isBrowser && isApi) {

    if (req.method === 'GET') {
      return of(new HttpResponse({ status: 200, url : req.url, body: [] }));
    }
    return of(new HttpResponse({ status: 204, url: req.url, body: null }));
  }

  if (isApi) {
    const token = inject(TokenService).get();
    if (token) {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
  }

  return next(req);
};
