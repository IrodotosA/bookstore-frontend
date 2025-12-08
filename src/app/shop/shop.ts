import { Component, OnInit, inject } from '@angular/core';
import { BookService } from '../services/book.service';
import { CartService } from '../services/cart.service';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { DrawerModule } from 'primeng/drawer';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { WishlistService } from '../services/wishlist.service';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

import { Book } from '../models/book.model';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    CommonModule, 
    CardModule, 
    ButtonModule, 
    HttpClientModule,
    DrawerModule,
    SelectModule,
    CheckboxModule,
    FormsModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    DialogModule,
    InputNumberModule
  ],
  templateUrl: './shop.html',
  styleUrl: './shop.scss',
})
export class Shop implements OnInit {

  constructor(
    private bookService: BookService,
    // private cartService: CartService,
    private wishlist: WishlistService,
    private auth: AuthService
  ) {}

  books: Book[] = [];
  filteredBooks: Book[] = [];
  visibleBooks: Book[] = [];

  selectedBook: Book | null = null;
  addToCartBook: Book | null = null;

  cart = inject(CartService); // or this.cartService if preferred

  showFilters = false;
  loading = true;

  searchQuery = '';
  showDetailsDialog = false;
  quantity = 1;
  showAddToCartDialog = false;

  apiUrl = environment.apiUrl;

  itemsPerPage = 9;
  currentIndex = 0;

  sortOptions = [
    { label: 'Price: Low → High', value: 'priceAsc' },
    { label: 'Price: High → Low', value: 'priceDesc' },
    { label: 'Newest', value: 'newest' }
  ];

  selectedSort: string | null = null;

  allCategories: string[] = [];
  selectedCategories: string[] = [];

  ngOnInit() {
    this.bookService.getAllBooks().subscribe({
      next: (data: Book[]) => {
        this.books = data;
        this.filteredBooks = [...data];
        this.allCategories = Array.from(new Set(data.map(b => b.category))).sort();
        this.resetVisibleBooks();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  openDetails(book: Book) {
    this.selectedBook = null;
    this.addToCartBook = book;
    this.quantity = 1;
    this.showDetailsDialog = true;

    this.bookService.getBookById(book._id).subscribe({
      next: (data: Book) => (this.selectedBook = data),
      error: (err) => console.error(err),
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

  toggleWishlist(book: Book) {
    if (!this.auth.isLoggedIn()) return;

    this.wishlist.toggle(book._id).subscribe({
      error: console.error
    });
  }

  isInWishlist(bookId: string): boolean {
    return this.wishlist.wishlistItems.includes(bookId);
  }

  applyFilters() {
    let result = [...this.books];

    const q = this.searchQuery.trim().toLowerCase();

    if (q !== '') {
      result = result.filter(book =>
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.category.toLowerCase().includes(q) ||
        (book.description ?? '').toLowerCase().includes(q)
      );
    }

    if (this.selectedCategories.length > 0) {
      result = result.filter(book =>
        this.selectedCategories.includes(book.category)
      );
    }

    if (this.selectedSort === 'priceAsc') result.sort((a, b) => a.price - b.price);
    if (this.selectedSort === 'priceDesc') result.sort((a, b) => b.price - a.price);
    if (this.selectedSort === 'newest') {
      result.sort((a, b) =>
        new Date(b.createdAt ?? '').getTime() - new Date(a.createdAt ?? '').getTime()
      );
    }

    this.filteredBooks = result;
    this.resetVisibleBooks();
    this.showFilters = false;
  }

  clearFilters() {
    this.selectedCategories = [];
    this.selectedSort = null;
    this.filteredBooks = [...this.books];
    this.resetVisibleBooks();
    this.showFilters = false;
  }

  resetVisibleBooks() {
    this.currentIndex = this.itemsPerPage;
    this.visibleBooks = this.filteredBooks.slice(0, this.itemsPerPage);
  }

  loadMore() {
    const nextIndex = this.currentIndex + this.itemsPerPage;
    const nextChunk = this.filteredBooks.slice(this.currentIndex, nextIndex);

    this.visibleBooks = [...this.visibleBooks, ...nextChunk];
    this.currentIndex = nextIndex;
  }
}
