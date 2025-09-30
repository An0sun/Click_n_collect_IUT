import { Component, inject } from '@angular/core';
import { LogoutComponent } from '../../features/authentification/components/logout/logout.component';
import { TokenService } from '../../../core/services/token.service';
@Component({
  selector: 'app-header',
  standalone: true, 
  imports: [LogoutComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  tokens = inject(TokenService);
}
