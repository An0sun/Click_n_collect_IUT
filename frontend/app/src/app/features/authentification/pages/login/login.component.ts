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
  loading=false; error='';
  constructor(private auth:AuthService, private router:Router){}
  private tokens = inject(TokenService);

  ngOnInit() {
    this.tokens.clear();
  }
  onSubmit(dto:{email:string;password:string}) {
    this.error='';
    this.auth.login(dto).subscribe({
      next: (user) => this.router.navigateByUrl('/welcome'),
      error: e => this.error = e.message || 'Connexion failed'
    });
  }
}
