import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const AdminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const tokenData = auth.getUser(); // You already decode token

  if (tokenData && tokenData.role === 'admin') {
    return true;
  }

  router.navigate(['/']);
  return false;
};