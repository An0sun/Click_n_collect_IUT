import { Component, inject } from '@angular/core';
import { AuthFormComponent } from '../../components/auth-form/auth-form.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { TokenService } from '../../../../../core/services/token.service';
@Component({
  selector: 'app-login',
  imports: [AuthFormComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  constructor(private auth:AuthService, private router:Router){}
  private tokens = inject(TokenService);


  onSubmit(dto: { email: string; password: string }) {
    this.auth.login(dto).subscribe({
      next: () => {
        const role = this.tokens.getRole?.();
        const target = role === 'ADMIN' ? '/admin/products' : '/app/product-list';
        this.router.navigateByUrl(target, { replaceUrl: true });
      }
    });
  }
}
