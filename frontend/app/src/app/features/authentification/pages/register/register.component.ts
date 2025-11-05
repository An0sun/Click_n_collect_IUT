import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthFormComponent } from '../../components/auth-form/auth-form.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { TokenService } from '../../../../../core/services/token.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, AuthFormComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}
  private tokens = inject(TokenService);

  onSubmit(dto: { name?: string; first_name?: string; firstName?: string; email?: string; password?: string }) {
    this.loading = true;
    this.error = '';

    const payload = {
      name: (dto.name ?? '').trim(),
      first_name: (dto.first_name ?? dto.firstName ?? '').trim(),
      email: (dto.email ?? '').trim(),
      password: dto.password ?? ''
    };



    this.auth.register(payload as any).subscribe({
      next: () => this.router.navigateByUrl('/auth/login'),
      error: e => { this.error = e.message || 'Registration faild'; this.loading = false; }
    });
  }

}
