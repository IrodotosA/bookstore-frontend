import { Component, signal, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Navbar } from './shared/navbar/navbar';
import { Footer } from './shared/footer/footer';
import { CommonModule } from '@angular/common';
import { WishlistService } from './services/wishlist.service';
import { AuthService } from './auth/auth.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('bookstore-frontend');
  router = inject(Router);
  wishlist = inject(WishlistService);
  auth = inject(AuthService);

  ngOnInit() {
    // Load wishlist ONLY if logged in
    if (this.auth.isLoggedIn()) {
      this.wishlist.loadWishlist().subscribe();
    }
  }

  isAdminRoute() {
    return this.router.url.startsWith('/admin');
  }
}