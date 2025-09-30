import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../../../../core/services/token.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [],
  templateUrl: `./logout.component.html`,
  styleUrl: './logout.component.scss'
})
export class LogoutComponent {
  @Input() label = 'Logout';
  private tokens = inject(TokenService);
  private router = inject(Router);

  logout() {
    this.tokens.clear();
    this.router.navigate(['/auth/login']);
  }
}
