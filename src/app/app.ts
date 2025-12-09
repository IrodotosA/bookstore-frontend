import { Component, signal, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Navbar } from './shared/navbar/navbar';
import { Footer } from './shared/footer/footer';
import { CommonModule } from '@angular/common';
import { WishlistService } from './services/wishlist.service';
import { AuthService } from './auth/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {

  protected readonly title = signal('bookstore-frontend');

  router = inject(Router);
  wishlist = inject(WishlistService);
  auth = inject(AuthService);

  // Convert wishlist observable → signal
  wishlistItems = toSignal(this.wishlist.wishlist$, { initialValue: [] });

  async ngOnInit() {
    // Load wishlist ONLY if logged in
    if (this.auth.isLoggedIn()) {
      try {
        await firstValueFrom(this.wishlist.loadWishlist());
      } catch (err) {
        console.error('Failed to load wishlist:', err);
      }
    }
  }

  isAdminRoute() {
    return this.router.url.startsWith('/admin');
  }
}
