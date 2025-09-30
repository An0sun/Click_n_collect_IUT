// src/app/core/guards/role.guard.ts
import { Injectable } from '@angular/core';
import { CanMatch, Route, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

@Injectable({ providedIn:'root' })
export class RoleGuard implements CanMatch {

  constructor(private tokens:TokenService, private router:Router){}

  canMatch(route: Route): boolean {
    if (!this.tokens.isLoggedIn()) { 
      this.router.navigate(['/auth/login']); return false;
    }
    
    const need = (route.data?.['roles'] as string[]) || [];
    const role = this.tokens.getRole();
    const ok = need.length === 0 || (!!role && need.includes(role));
    if (!ok) this.router.navigate(['/']);
    return ok;
  }
}
