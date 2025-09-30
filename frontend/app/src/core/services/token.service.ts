import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const KEY = 'app_token';

@Injectable({ providedIn:'root' })
export class TokenService{
  constructor(@Inject(PLATFORM_ID) private platformId: Object){}

  private get isBrowser() { return isPlatformBrowser(this.platformId); }

  set(t:string){
    if (!this.isBrowser) return;
    localStorage.setItem(KEY, t);
  }

  get(){
    if (!this.isBrowser) return null;
    return localStorage.getItem(KEY);
  }

  clear(){
    if (!this.isBrowser) return;
    localStorage.removeItem(KEY);
  }

  private dec(){
    if (!this.isBrowser) return null;
    const t = this.get();
    if (!t) return null;
    const [, p] = t.split('.');
    try {
      return JSON.parse(atob(p.replace(/-/g,'+').replace(/_/g,'/')));
    } catch {
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
