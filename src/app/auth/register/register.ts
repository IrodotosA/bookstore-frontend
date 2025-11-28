import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    FloatLabelModule,
    MessageModule,
    CardModule,
    RouterLink,
    ToastModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    // ✅ Build form inside constructor (fixes fb-before-init)
    this.registerForm = new FormGroup(
      {
        name: this.fb.control('', [Validators.required]),
        email: this.fb.control('', [
          Validators.required,
          Validators.email,
        ]),
        password: this.fb.control('', [
          Validators.required,
          Validators.minLength(6),
          Register.strongPassword
        ]),
        confirmPassword: this.fb.control('', Validators.required),
      },
      { validators: [Register.passwordMatchValidator] }
    );
  }

  static strongPassword(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSymbol = /[^A-Za-z0-9]/.test(value);

    const valid = hasUpper && hasLower && hasNumber && hasSymbol;

    return valid ? null : { weakPassword: true };
  }

  // Getters
  get name() {
    return this.registerForm.get('name');
  }
  get email() {
    return this.registerForm.get('email');
  }
  get password() {
    return this.registerForm.get('password');
  }
  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  // Static cross-field validator
  static passwordMatchValidator(
    group: AbstractControl
  ): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { name, email, password } = this.registerForm.value;

    this.auth.register({ name: name!, email: email!, password: password! }).subscribe({
      next: (res) => {
        this.isLoading = false;
                // success toast
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Registration complete! Please log in.'
        });

        // redirect after short delay
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message || 'Registration failed. Please try again.';
      },
    });
  }
}
