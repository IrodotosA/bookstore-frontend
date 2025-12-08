import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

import { UserService } from '../services/user.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    MessageModule
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class Settings implements OnInit {

  private userService = inject(UserService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  ngOnInit() {
    const user = this.auth.getUser();

    this.profileForm = this.fb.group({
      name: [user?.name || '', Validators.required],
      email: [user?.email || '', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group(
      {
        oldPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6), Settings.strongPassword]],
        confirmPassword: ['', Validators.required]
      },
      { validators: [this.matchPasswords()] }
    );
  }

  // --- Validator: confirmPassword === newPassword ---
  matchPasswords() {
    return (group: AbstractControl): ValidationErrors | null => {
      const newPass = group.get('newPassword')?.value;
      const confirm = group.get('confirmPassword')?.value;
      return newPass === confirm ? null : { mismatch: true };
    };
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

  // --- Save Profile ---
  saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.userService.updateMyProfile(this.profileForm.value).subscribe({
      next: (res) => {
        this.auth.saveToken(res.token);
        alert('Profile updated successfully');
      },
      error: () => alert('Failed to update profile')
    });
  }

  // --- Change Password ---
  changePassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { oldPassword, newPassword } = this.passwordForm.value;

    this.userService.changePassword({ oldPassword, newPassword }).subscribe({
      next: () => alert('Password changed successfully'),
      error: (err) => alert(err.error?.message || 'Error changing password')
    });
  }

  // Getters for template
  get pf() { return this.profileForm.controls; }
  get pwf() { return this.passwordForm.controls; }
}
