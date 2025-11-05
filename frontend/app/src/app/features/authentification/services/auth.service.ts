import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { TokenService } from '../../../../core/services/token.service';

export type PublicUser = { id:number; name:string; first_name:string; email:string; role:'CLIENT'|'ADMIN' };

@Injectable({ providedIn:'root' })
export class AuthService {
  private base = 'http://localhost:5000';

  constructor(private http: HttpClient, private tokens: TokenService) {}

login(payload: { email: string; password: string }): Observable<PublicUser> {
  return this.http.post<any>(`${this.base}/auth/login`, payload).pipe(
    tap(res => {
      const token = res?.token ?? res?.data?.token;
      if (!token) throw new Error('Login failed');
      this.tokens.set(token);
    }),
    map(res => {
      const user = (res?.user ?? res?.data?.user) as PublicUser | undefined;
      if (!user) throw new Error('Login failed');
      return user;
    })
  );
}

register(payload: { name: string; first_name: string; email: string; password: string }): Observable<PublicUser> {
  return this.http.post<any>(`${this.base}/auth/register`, payload).pipe(
    map(res => {
      const user = (res?.id ? res : res?.data) as PublicUser | undefined;
      if (!user) throw new Error('Registration failed');
      return user;
    })
  );
}
}
