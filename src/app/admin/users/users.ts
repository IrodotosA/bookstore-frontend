import { Component, inject, effect } from '@angular/core';
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

import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

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
export class AdminUsers {

  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  users: User[] = [];
  filteredUsers: User[] = [];

  loading = true;
  userDialog = false;

  selectedUser: User | null = null;
  searchTerm = '';

  userForm!: FormGroup;

  roles = [
    { label: 'User', value: 'user' as UserRole },
    { label: 'Admin', value: 'admin' as UserRole }
  ];

  // --- Load users as a signal ---
  private usersSig = toSignal(
    this.userService.getAllUsers(),
    { initialValue: [] as User[] }
  );

  constructor() {
    this.initForm();

    // react when usersSig() emits
    effect(() => {
      const list = this.usersSig();
      if (!list) return;

      this.users = list;
      this.filteredUsers = [...list];
      this.loading = false;
    });
  }

  initForm() {
    this.userForm = this.fb.group({
      role: ['user', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  // --------------------
  // FILTER
  // --------------------
  filterUsers() {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredUsers = this.users.filter((u) => {
      const name = u.name?.toLowerCase().includes(term);
      const email = u.email?.toLowerCase().includes(term);
      return name || email;
    });
  }

  // --------------------
  // EDIT USER
  // --------------------
  editUser(user: User) {
    this.selectedUser = user;

    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      role: user.role
    });

    this.userDialog = true;
  }

  // --------------------
  // DELETE USER
  // --------------------
  async deleteUser(user: User) {
    if (!confirm(`Delete user ${user.email}?`)) return;

    try {
      await firstValueFrom(this.userService.deleteUser(user._id));

      this.users = this.users.filter((u) => u._id !== user._id);
      this.filteredUsers = this.filteredUsers.filter((u) => u._id !== user._id);

    } catch (err) {
      console.error(err);
    }
  }

  // --------------------
  // SAVE USER
  // --------------------
  async saveUser() {
    if (this.userForm.invalid || !this.selectedUser) {
      this.userForm.markAllAsTouched();
      return;
    }

    const payload = this.userForm.value;

    try {
      const updated = await firstValueFrom(
        this.userService.updateUser(this.selectedUser._id, payload)
      );

      const i = this.users.findIndex(u => u._id === updated._id);
      if (i !== -1) this.users[i] = updated;

      this.filteredUsers = [...this.users];
      this.userDialog = false;

    } catch (err) {
      console.error(err);
    }
  }
}
