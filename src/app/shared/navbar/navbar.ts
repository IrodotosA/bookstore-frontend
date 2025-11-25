import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RouterModule, RouterLink, RouterLinkActive, Router  } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  auth = inject(AuthService);
  cart = inject(CartService);
  router = inject(Router);
  isScrolled = false;

  constructor() {
    window.addEventListener('scroll', () => {
      this.isScrolled = window.scrollY > 50;
    });
  }

    get forceSolid() {
      const url = this.router.url;

      return (
        url.startsWith('/login') ||
        url.startsWith('/register') ||
        url.startsWith('/admin')
      );
    }


  logout() {
    this.auth.logout();
    window.location.href = '/';   // refresh navbar instantly
  }
}
