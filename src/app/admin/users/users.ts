import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { UserService } from '../../services/user.service';

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
    FormsModule
  ],
  templateUrl: './users.html',
  styleUrl: './users.scss'
})
export class AdminUsers implements OnInit {
  private userService = inject(UserService);

  users: any[] = [];
  loading = true;
  userDialog = false;
  selectedUser: any = null;
  searchTerm: string = '';
  filteredUsers: any[] = [];

  roles = [
    { label: 'User', value: 'user' },
    { label: 'Admin', value: 'admin' }
  ];

  form = {
    name: '',
    email: '',
    role: 'user'
  };

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;   // IMPORTANT
        this.loading = false;
      },
      error: (err) => console.error(err)
    });
  }

  filterUsers() {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredUsers = this.users.filter(u => {
      const nameMatch = u.name?.toLowerCase().includes(term);
      const emailMatch = u.email?.toLowerCase().includes(term);
      return nameMatch || emailMatch;
    });
  }

  editUser(user: any) {
    this.selectedUser = user;
    this.form = {
      name: user.name,
      email: user.email,
      role: user.role
    };
    this.userDialog = true;
  }

  deleteUser(user: any) {
    if (!confirm(`Delete user ${user.email}?`)) return;

    this.userService.deleteUser(user._id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u._id !== user._id);
      }
    });
  }

  saveUser() {
    this.userService.updateUser(this.selectedUser._id, this.form).subscribe({
      next: (updated: any) => {   // <-- FIX HERE
        const index = this.users.findIndex(u => u._id === updated._id);
        if (index !== -1) this.users[index] = updated;
        this.userDialog = false;
      }
    });
  }
}
