import { Component, inject, Input } from '@angular/core';
import { TokenService } from '../../../core/services/token.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

export type Role = 'ADMIN' | 'CLIENT';

export interface HomeItem {
  label: string;
  description?: string;
  link: string;
  roles?: Role[];
  icon?: string;
}

@Component({
  selector: 'app-generic-home',
  imports: [RouterLink],
  templateUrl: './generic-home.component.html',
  styleUrl: './generic-home.component.scss'
})


export class GenericHomeComponent {
  private token = inject(TokenService);

  @Input({ required: true }) items: HomeItem[] = [];

  get visibleItems(): HomeItem[] {
    const role = this.token.getRole() as Role | null;
    return this.items.filter(it => !it.roles || (role && it.roles.includes(role)));
  }
}
