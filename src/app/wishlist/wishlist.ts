import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WishlistService } from '../services/wishlist.service';
import { BookService } from '../services/book.service';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import { CartService } from '../services/cart.service';
import { Book } from '../models/book.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    CardModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    FormsModule
  ],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss'
})
export class Wishlist {

  wishlist = inject(WishlistService);
  bookService = inject(BookService);
  cart = inject(CartService);
  router = inject(Router);

  apiUrl = environment.apiUrl;

  // Local reactive state
  books: Book[] = [];
  filteredBooks: Book[] = [];
  loading = true;

  selectedBook: Book | null = null;
  showDetailsDialog = false;

  addToCartBook: Book | null = null;
  showAddToCartDialog = false;

  quantity = 1;
  searchQuery = '';

  // Convert wishlist IDs → signal
  wishlistIds = toSignal(this.wishlist.wishlist$, { initialValue: [] });

  // Convert all books → signal so we can filter client-side
  allBooksSig = toSignal(this.bookService.getAllBooks(), { initialValue: [] });

  constructor() {

    // Effect: whenever wishlist changes → recompute books
    effect(() => {
      const ids = this.wishlistIds();
      const allBooks = this.allBooksSig();

      if (!ids || ids.length === 0) {
        this.books = [];
        this.filteredBooks = [];
        this.loading = false;
        return;
      }

      this.books = allBooks.filter(b => ids.includes(b._id));
      this.filteredBooks = [...this.books];
      this.loading = false;
    });

  }

  async emptyWishlist() {
    try {
      await firstValueFrom(this.wishlist.clearAll());
      // effect (wishlistIds + allBooks) will handle UI
    } catch (err) {
      console.error('Failed to clear wishlist:', err);
    }
  }

  applySearch() {
    const q = this.searchQuery.toLowerCase().trim();

    if (!q) {
      this.filteredBooks = [...this.books];
      return;
    }

    this.filteredBooks = this.books.filter(book =>
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      book.category.toLowerCase().includes(q)
    );
  }

  async openDetails(book: Book) {
    this.selectedBook = null;
    this.addToCartBook = book;
    this.quantity = 1;
    this.showDetailsDialog = true;

    this.selectedBook = await firstValueFrom(
      this.bookService.getBookById(book._id)
    );
  }

  openAddToCart(book: Book) {
    this.addToCartBook = book;
    this.quantity = 1;
    this.showAddToCartDialog = true;
  }

  confirmAddToCart(event: Event) {
    event.stopPropagation();

    if (this.addToCartBook) {
      this.cart.addToCart(this.addToCartBook, this.quantity);
    }

    this.showAddToCartDialog = false;
    this.showDetailsDialog = false;
    this.addToCartBook = null;
    this.selectedBook = null;
  }

  increaseQuantity() { this.quantity++; }
  decreaseQuantity() { this.quantity = Math.max(1, this.quantity - 1); }

  async remove(book: Book) {
    await firstValueFrom(this.wishlist.remove(book._id));
    // effect auto-updates UI
  }

  async toggleWishlist(book: Book) {
    await firstValueFrom(this.wishlist.toggle(book._id));
    // effect auto-updates UI
  }

  isInWishlist(id: string) {
    return this.wishlist.isInWishlist(id);
  }

  goToShop() {
    this.router.navigate(['/shop']);
  }
}
