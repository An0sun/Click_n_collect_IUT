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

  ngOnInit() {
    this.tokens.clear();
  }
  onSubmit(dto: { name: string; first_name: string; email: string; password: string }) {
    this.loading = true; this.error = '';
    this.auth.register(dto).subscribe({
      next: () => this.router.navigateByUrl('/auth/login'),
      error: e => { this.error = e.message || 'Register failde'; this.loading = false; }
    });
  }
}
