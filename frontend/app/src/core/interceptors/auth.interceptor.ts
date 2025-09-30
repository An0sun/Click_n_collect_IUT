// src/app/core/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private tokens:TokenService, private router:Router){}

  intercept(req:HttpRequest<any>, next:HttpHandler):Observable<HttpEvent<any>> {
    const token=this.tokens.get();
    const cloned = token? req.clone({ setHeaders:{ Authorization:`Bearer ${token}` }}) : req;
    return next.handle(cloned).pipe(
      catchError(err=>{
        if(err.status===401){ this.tokens.clear(); this.router.navigate(['/auth/login']); }
        return throwError(()=>err);
      })
    );
  }
}
export const authInterceptorProvider = {
  provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true
};
