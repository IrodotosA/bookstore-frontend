import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup
} from '@angular/forms';
import { MessageModule } from 'primeng/message';

import { UserService } from '../../services/user.service';
import { User, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    SelectModule,
    InputTextModule,
    FormsModule,  
    ReactiveFormsModule,
    MessageModule
  ],
  templateUrl: './users.html',
  styleUrl: './users.scss'
})
export class AdminUsers implements OnInit {

  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  users: User[] = [];
  filteredUsers: User[] = [];

  loading = true;
  userDialog = false;

  selectedUser: User | null = null;
  searchTerm = '';

  userForm!: FormGroup;

  roles: { label: string; value: UserRole }[] = [
    { label: 'User', value: 'user' },
    { label: 'Admin', value: 'admin' }
  ];

  ngOnInit() {
    this.initForm();
    this.loadUsers();
  }

  initForm() {
    this.userForm = this.fb.group({
      role: ['user', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (data: User[]) => {
        this.users = data;
        this.filteredUsers = data;
        this.loading = false;
      },
      error: (err) => console.error(err)
    });
  }

  filterUsers() {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredUsers = this.users.filter((u) => {
      const nameMatch = u.name?.toLowerCase().includes(term);
      const emailMatch = u.email?.toLowerCase().includes(term);
      return nameMatch || emailMatch;
    });
  }

  editUser(user: User) {
    this.selectedUser = user;

    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      role: user.role
    });

    this.userDialog = true;
  }

  deleteUser(user: User) {
    if (!confirm(`Delete user ${user.email}?`)) return;

    this.userService.deleteUser(user._id).subscribe(() => {
      this.users = this.users.filter((u) => u._id !== user._id);
      this.filteredUsers = this.filteredUsers.filter((u) => u._id !== user._id);
    });
  }

  saveUser() {
    if (this.userForm.invalid || !this.selectedUser) {
      this.userForm.markAllAsTouched();
      return;
    }

    const payload = this.userForm.value;

    this.userService.updateUser(this.selectedUser._id, payload).subscribe({
      next: (updated: User) => {
        const index = this.users.findIndex((u) => u._id === updated._id);
        if (index !== -1) this.users[index] = updated;

        this.userDialog = false;
      },
      error: (err) => console.error(err)
    });
  }
}
