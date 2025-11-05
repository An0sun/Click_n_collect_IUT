import { Component, inject } from '@angular/core';
import { LogoutComponent } from '../../features/authentification/components/logout/logout.component';
import { TokenService } from '../../../core/services/token.service';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-header',
  standalone: true, 
  imports: [LogoutComponent, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  isMenuOpen = false;
  tokens = inject(TokenService);

  get isAdmin() {
    return this.tokens.getRole?.() === 'ADMIN';
  }
}
