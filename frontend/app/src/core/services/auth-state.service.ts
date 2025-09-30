import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Role = 'CLIENT'|'ADMIN';
export interface PublicUser { id:number; name:string; first_name:string; email:string; role:Role; }

@Injectable({ providedIn: 'root' })
export class AuthState {
  private _user$ = new BehaviorSubject<PublicUser | null>(null);
  user$ = this._user$.asObservable();

  get user(): PublicUser | null { return this._user$.value; }
  get role(): Role | null { return this._user$?.value?.role ?? null; }
  get isLoggedIn(): boolean { return !!this._user$.value; }

  setUser(u : PublicUser | null) { this._user$.next(u); }
  clear() { this._user$.next(null); }
}