import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

type Mode = 'login' | 'register';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './auth-form.component.html',
})
export class AuthFormComponent {
  @Input() mode: Mode = 'login';
  @Input() submitLabel = 'Continuer';
  @Output() submitted = new EventEmitter<any>();
  private authForm = inject(FormBuilder);

  form = this.authForm.group({
    name: [''],
    first_name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), this.strongPassword]],
  });


  get isRegister() { return this.mode === 'register'; }

  strongPassword(control: any) {
    const v: string = String(control.value || '');
    if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return { weakPassword: true };
    return null;
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { name, first_name, email, password } = this.form.value;

    const payload: any = {
      email: (email || '').toLowerCase().trim(),
      password,
    };
    if (this.isRegister) {
      payload.name = (name || '').trim();
      payload.first_name = (first_name || '').trim();
    }
    this.submitted.emit(payload);
  }
}
