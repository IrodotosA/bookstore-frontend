import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../auth.service';
import { WishlistService } from '../../services/wishlist.service';

@Component({
  selector: 'app-login',
  standalone: true,
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
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder, 
    private auth: AuthService,
    private wishlist: WishlistService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    try {
      const { email, password } = this.loginForm.value;

      // Login
      const res = await firstValueFrom(
        this.auth.login({ email: email!, password: password! })
      );

      this.auth.saveToken(res.token);

      // Load wishlist
      await firstValueFrom(this.wishlist.loadWishlist());

      // Redirect
      const redirectTo = this.route.snapshot.queryParams['redirectTo'] || '/';
      this.router.navigate([redirectTo]);

    } catch (err: any) {
      this.errorMessage =
        err?.error?.message || 'Login failed. Please check your email and password.';
      console.error('Login error:', err);

    } finally {
      this.isLoading = false;
    }
  }
}
