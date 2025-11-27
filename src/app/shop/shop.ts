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
export class Shop {

  constructor(
    private bookService: BookService,
    private cartService: CartService,
    private wishlist: WishlistService,
    private auth: AuthService
  ) {}

  books: any[] = [];
  filteredBooks: any[] = []
  cart = inject(CartService);
  showFilters = false;
  loading = true;
  searchQuery: string = '';
  selectedBook: any = null;
  showDetailsDialog: boolean = false;
  quantity: number = 1;
  showAddToCartDialog: boolean = false;
  addToCartBook: any = null;

  sortOptions = [
    { label: 'Price: Low → High', value: 'priceAsc' },
    { label: 'Price: High → Low', value: 'priceDesc' },
    { label: 'Newest', value: 'newest' }
  ];

  selectedSort: string | null = null;

  // Categories
  allCategories = ['Fantasy', 'Mystery', 'Sci-Fi', 'Horror'];
  selectedCategories: string[] = [];

  openDetails(book: any) {
    this.selectedBook = null;
    this.addToCartBook = book;
    this.quantity = 1;
    this.showDetailsDialog = true;

    this.bookService.getBookById(book._id).subscribe({
      next: (data) => (this.selectedBook = data),
      error: (err) => console.error(err),
    });
  }

  confirmAddToCart(event: Event) {
    event.stopPropagation();
    this.cart.addToCart(this.addToCartBook, this.quantity);
    // close dialogs
    this.showAddToCartDialog = false;
    this.showDetailsDialog = false;

    // reset
    this.addToCartBook = null;
    this.selectedBook = null;
  }

  openAddToCart(book: any) {
    this.addToCartBook = book;
    this.quantity = 1;
    this.showAddToCartDialog = true;
  }

  increaseQuantity() {
    this.quantity = this.quantity + 1;
  }

  decreaseQuantity() {
    this.quantity = Math.max(1, this.quantity - 1);
  }

  applyFilters() {
    let result = [...this.books];

    if (this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase();

      result = result.filter(book =>
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.category.toLowerCase().includes(q) ||
        book.description.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (this.selectedCategories.length > 0) {
      result = result.filter(book =>
        this.selectedCategories.includes(book.category)
      );
    }

    // Sorting
    if (this.selectedSort === 'priceAsc') {
      result.sort((a, b) => a.price - b.price);
    }
    if (this.selectedSort === 'priceDesc') {
      result.sort((a, b) => b.price - a.price);
    }
    if (this.selectedSort === 'newest') {
      result.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    this.filteredBooks = result;
    this.showFilters = false;
  }

  clearFilters() {
    this.selectedCategories = [];
    this.selectedSort = null;
    this.filteredBooks = [...this.books];
    this.showFilters = false;
  }

  toggleWishlist(book: any) {
    if (!this.auth.isLoggedIn()) {
      // optional: open login dialog
      return;
    }

    this.wishlist.toggle(book._id).subscribe({
      next: () => {},
      error: (err) => console.error(err),
    });
  }

  isInWishlist(bookId: string): boolean {
    return this.wishlist.wishlistItems.includes(bookId);
  }

  ngOnInit() {
    this.bookService.getAllBooks().subscribe({
      next: (data) => {
        this.books = data;
        this.filteredBooks = [...data];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}
