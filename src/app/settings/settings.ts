import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { UserService } from '../services/user.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class Settings implements OnInit {
  private userService = inject(UserService);
  private auth = inject(AuthService);

  form = {
    name: '',
    email: ''
  };

  pw = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  ngOnInit() {
    const user = this.auth.getUser();
    if (user) {
      this.form.name = user.name;
      this.form.email = user.email;
    }
  }

  saveProfile() {
    this.userService.updateMyProfile(this.form).subscribe({
      next: (res) => {
        this.auth.saveToken(res.token);  // << SAVE NEW TOKEN
        alert('Profile updated');
      },
      error: (err) => {
        console.error(err);
        alert('Failed to update profile');
      }
    });
  }

  changePassword() {
    if (this.pw.newPassword !== this.pw.confirmPassword) {
      return alert('New passwords do not match');
    }

    this.userService.changePassword({
      oldPassword: this.pw.oldPassword,
      newPassword: this.pw.newPassword
    }).subscribe({
      next: () => alert('Password changed successfully'),
      error: (err) => alert(err.error?.message || 'Error changing password')
    });
  }
}