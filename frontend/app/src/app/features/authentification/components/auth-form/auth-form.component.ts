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
    email: ['', []],
    password: ['', []],
  });


  get isRegister() { return this.mode === 'register'; }

    ngOnInit() {
    const form = this.form.controls;

    form.email.setValidators([Validators.required, Validators.email]);

    if (this.isRegister) {
      form.name.setValidators([Validators.required, Validators.minLength(2)]);
      form.first_name.setValidators([Validators.required, Validators.minLength(2)]);
      form.password.setValidators([Validators.required, Validators.minLength(8)]);
    } 
    else {
      form.password.setValidators([Validators.required]);
    }

    form.email.updateValueAndValidity({ emitEvent: false });
    form.name.updateValueAndValidity({ emitEvent: false });
    form.first_name.updateValueAndValidity({ emitEvent: false });
    form.password.updateValueAndValidity({ emitEvent: false });
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
