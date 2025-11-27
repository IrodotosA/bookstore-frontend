import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { RouterModule, RouterLink, RouterLinkActive, Router  } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, MenuModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  auth = inject(AuthService);
  cart = inject(CartService);
  router = inject(Router);
  isScrolled = false;
  items: any[] = [];

  constructor() {
    window.addEventListener('scroll', () => {
      this.isScrolled = window.scrollY > 50;
      const menuEl: any = document.querySelector('.p-menu-overlay');
      if (menuEl) {
        menuEl.style.display = 'none';
      }
    });
  }

  ngOnInit() {
    this.auth.authState$.subscribe(() => {
      this.buildMenu(); // rebuild menu whenever login/logout happens
    });
  }

  buildMenu() {
    const isLogged = this.auth.isLoggedIn();
    const isAdmin = this.auth.isAdmin();

    this.items = [
      {
        label: 'Shop',
        items: [
          { label: 'Home', icon: 'pi pi-home', routerLink: '/' },
          { label: 'Shop', icon: 'pi pi-shopping-bag', routerLink: '/shop' },
          { label: 'Contact', icon: 'pi pi-comment', routerLink: '/contact'},
          ...(isAdmin
            ? [{ label: 'Admin', icon: 'pi pi-shield', routerLink: '/admin' }]
            : [])
        ]
      },

      { separator: true },

      {
        label: 'Account',
        items: [
          ...(isLogged
            ? [
              { label: 'Wishlist', icon: 'pi pi-heart', routerLink: '/wishlist' },
              { label: 'My Orders', icon: 'pi pi-list', routerLink: '/my-orders' },
              { label: 'Settings', icon: 'pi pi-cog', routerLink: '/settings' },
            ]
            : []),



          ...(isLogged
            ? [{
                label: 'Logout',
                icon: 'pi pi-sign-out',
                command: () => this.logout()
              }]
            : [
                { label: 'Login', icon: 'pi pi-sign-in', routerLink: '/login' },
                { label: 'Register', icon: 'pi pi-user-plus', routerLink: '/register' }
              ])
        ]
      },

      { separator: true },

      ...(isLogged
        ? [{
            label: this.auth.getUser()?.name || 'User',
            items: [
              {
                label: this.auth.getUser()?.email || '',
                style: { opacity: 0.8, 'font-size': '0.85rem', 'pointer-events': 'none' }
              }
            ]
          }]
        : [])
    ];
  }

    get forceSolid() {
      const url = this.router.url;

      return (
        url.startsWith('/login') ||
        url.startsWith('/register') ||
        url.startsWith('/admin') ||
        url.startsWith('/settings')
      );
    }


  logout() {
    this.auth.logout();
    window.location.href = '/';   // refresh navbar instantly
  }
}
