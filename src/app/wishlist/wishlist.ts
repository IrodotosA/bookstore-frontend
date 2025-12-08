import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WishlistService } from '../services/wishlist.service';
import { BookService } from '../services/book.service';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CartService } from '../services/cart.service';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';

import { Book } from '../models/book.model';

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
export class Wishlist implements OnInit {

  wishlist = inject(WishlistService);
  bookService = inject(BookService);
  cart = inject(CartService);
  router = inject(Router);

  apiUrl = environment.apiUrl;

  books: Book[] = [];
  filteredBooks: Book[] = [];
  loading = true;

  selectedBook: Book | null = null;
  showDetailsDialog = false;

  addToCartBook: Book | null = null;
  showAddToCartDialog = false;

  quantity = 1;
  searchQuery = '';

  ngOnInit() {
    this.wishlist.wishlist$.subscribe(ids => {
      if (ids.length === 0) {
        this.books = [];
        this.filteredBooks = [];
        this.loading = false;
        return;
      }

      this.bookService.getAllBooks().subscribe({
        next: (allBooks: Book[]) => {
          this.books = allBooks.filter(b => ids.includes(b._id));
          this.filteredBooks = [...this.books];
          this.loading = false;
        },
        error: () => (this.loading = false)
      });
    });
  }

  emptyWishlist() {
    this.wishlist.clearAll().subscribe(() => {
      this.books = [];
      this.filteredBooks = [];
    });
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

  openDetails(book: Book) {
    this.selectedBook = null;
    this.addToCartBook = book;
    this.quantity = 1;
    this.showDetailsDialog = true;

    this.bookService.getBookById(book._id).subscribe({
      next: (data: Book) => (this.selectedBook = data),
      error: err => console.error(err)
    });
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

  increaseQuantity() {
    this.quantity++;
  }

  decreaseQuantity() {
    this.quantity = Math.max(1, this.quantity - 1);
  }

  remove(book: Book) {
    this.wishlist.remove(book._id).subscribe();
  }

  toggleWishlist(book: Book) {
    this.wishlist.toggle(book._id).subscribe();
  }

  isInWishlist(id: string) {
    return this.wishlist.isInWishlist(id);
  }

  goToShop() {
    this.router.navigate(['/shop']);
  }
}
