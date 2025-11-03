import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {jwtDecode } from 'jwt-decode';
const KEY = 'app_token';

@Injectable({ providedIn:'root' })
export class TokenService{
  constructor(@Inject(PLATFORM_ID) private platformId: Object){}

  private get isBrowser() { return isPlatformBrowser(this.platformId); }

  set(token: string) {
    if (!this.isBrowser) return;
    localStorage.setItem('token', token);
  }

  get(){
    if (!this.isBrowser) return null;
    return localStorage.getItem('token');
  }

  getUserId(): number | null {
    const payload = this.dec();
    return payload?.sub ?? payload?.id ?? null;
  }

  getUserName(): string | null {
    return this.dec()?.name ?? null;
  }

  getUserEmail(): string | null {
    return this.dec()?.email ?? null;
  }

  clear(){
    if (!this.isBrowser) return;
    localStorage.removeItem('token');
  }

  dec(): any | null {
    const token = this.get();
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch (e) {
      console.error('Token decoding error:', e);
      return null;
    }
  }

  getRole(): 'ADMIN' | 'CLIENT' | null {
    return this.dec()?.role ?? null;
  }

  isExpired(){
    const exp = this.dec()?.exp;
    return exp ? (Date.now()/1000) > exp : true;
  }

  isLoggedIn(){
    if (!this.isBrowser) return false;
    return !!this.get() && !this.isExpired();
  }

}
