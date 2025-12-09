import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

import { BookService } from '../services/book.service';
import { CartService } from '../services/cart.service';
import { WishlistService } from '../services/wishlist.service';
import { AuthService } from '../auth/auth.service';

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
  styleUrl: './shop.scss'
})
export class Shop implements OnInit {

  // SERVICES
  private bookService = inject(BookService);
  private wishlist = inject(WishlistService);
  private auth = inject(AuthService);
  cart = inject(CartService);

  apiUrl = environment.apiUrl;

  // SIGNAL STATE FOR BOOK LISTING
  books = signal<Book[]>([]);
  filteredBooks = signal<Book[]>([]);
  visibleBooks = signal<Book[]>([]);
  allCategories = signal<string[]>([]);
  loading = signal(true);

  // Only drawer uses signal (wishlist pattern)
  showFilters = signal(false);

  // DIALOG + BOOK SELECTION (NO SIGNALS – same as Wishlist)
  showDetailsDialog = false;
  showAddToCartDialog = false;

  selectedBook: Book | null = null;
  addToCartBook: Book | null = null;

  quantity = 1;

  // FILTER STATE
  searchQuery = '';
  selectedSort: string | null = null;
  selectedCategories: string[] = [];

  itemsPerPage = 9;
  currentIndex = 0;

  sortOptions = [
    { label: 'Price: Low → High', value: 'priceAsc' },
    { label: 'Price: High → Low', value: 'priceDesc' },
    { label: 'Newest', value: 'newest' }
  ];

  // Load books with toSignal
  booksFromApi = toSignal(this.bookService.getAllBooks(), { initialValue: [] });

  constructor() {
    effect(() => {
      const data = this.booksFromApi();

      if (data.length > 0) {
        this.books.set(data);
        this.filteredBooks.set([...data]);

        this.allCategories.set(
          Array.from(new Set(data.map(b => b.category))).sort()
        );

        this.resetVisibleBooks();
        this.loading.set(false);
      }
    });
  }

  ngOnInit() { }

  // -------------------------------
  // DETAILS
  // -------------------------------
  async openDetails(book: Book) {
    this.showAddToCartDialog = false;
    this.selectedBook = null;
    this.addToCartBook = null;

    this.quantity = 1;
    this.showDetailsDialog = true;

    this.selectedBook = await firstValueFrom(
      this.bookService.getBookById(book._id)
    );
  }

  // -------------------------------
  // ADD TO CART
  // -------------------------------
  openAddToCart(book: Book) {
    this.showDetailsDialog = false;
    this.selectedBook = null;

    this.addToCartBook = book;
    this.quantity = 1;
    this.showAddToCartDialog = true;
  }

  confirmAddToCart(event: Event) {
    event.stopPropagation();

    let book = this.addToCartBook || this.selectedBook;

    if (book) {
      this.cart.addToCart(book, this.quantity);
    }

    this.showAddToCartDialog = false;
    this.showDetailsDialog = false;

    this.addToCartBook = null;
    this.selectedBook = null;
  }

  increaseQuantity() { this.quantity++; }
  decreaseQuantity() { this.quantity = Math.max(1, this.quantity - 1); }

  // -------------------------------
  // WISHLIST
  // -------------------------------
  async toggleWishlist(book: Book) {
    if (!this.auth.isLoggedIn()) return;
    await firstValueFrom(this.wishlist.toggle(book._id));
  }

  isInWishlist(bookId: string) {
    return this.wishlist.wishlistItems.includes(bookId);
  }

  // -------------------------------
  // FILTERS
  // -------------------------------
  applyFilters() {
    let result = [...this.books()];
    const q = this.searchQuery.trim().toLowerCase();

    if (q) {
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        (b.description ?? '').toLowerCase().includes(q)
      );
    }

    const cats = this.selectedCategories;
    if (cats.length > 0) {
      result = result.filter(b => cats.includes(b.category));
    }

    if (this.selectedSort === 'priceAsc') result.sort((a, b) => a.price - b.price);
    if (this.selectedSort === 'priceDesc') result.sort((a, b) => b.price - a.price);
    if (this.selectedSort === 'newest') {
      result.sort((a, b) =>
        new Date(b.createdAt ?? '').getTime() -
        new Date(a.createdAt ?? '').getTime()
      );
    }

    this.filteredBooks.set(result);
    this.resetVisibleBooks();
    this.showFilters.set(false);
  }

  clearFilters() {
    this.selectedCategories = [];
    this.selectedSort = null;
    this.filteredBooks.set([...this.books()]);
    this.resetVisibleBooks();
    this.showFilters.set(false);
  }

  resetVisibleBooks() {
    this.currentIndex = this.itemsPerPage;
    this.visibleBooks.set(
      this.filteredBooks().slice(0, this.itemsPerPage)
    );
  }

  loadMore() {
    const next = this.currentIndex + this.itemsPerPage;
    const nextChunk = this.filteredBooks().slice(this.currentIndex, next);

    this.visibleBooks.update(v => [...v, ...nextChunk]);
    this.currentIndex = next;
  }
}
