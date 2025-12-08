import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';

import { environment } from '../../environments/environment';
import { BookService } from '../services/book.service';
import { CartService } from '../services/cart.service';

import { Book } from '../models/book.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CarouselModule,
    ButtonModule,
    DialogModule,
    InputNumberModule,
    CardModule,
    FormsModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {

  books: Book[] = [];
  featured: Book[] = [];

  selectedBook: Book | null = null;
  addToCartBook: Book | null = null;

  showDetailsDialog = false;
  showAddToCartDialog = false;

  isMobile = false;
  quantity = 1;

  apiUrl = environment.apiUrl;

  private cart = inject(CartService);
  private bookService = inject(BookService);

  ngOnInit() {
    this.updateIsMobile();

    window.addEventListener('resize', () => this.updateIsMobile());

    // Newest books
    this.bookService.getNewestBooks().subscribe({
      next: (data: Book[]) => {
        this.books = data;
      }
    });

    // Featured books
    this.bookService.getFeaturedBooks().subscribe({
      next: (data: Book[]) => {
        this.featured = data;
      }
    });
  }

  updateIsMobile() {
    this.isMobile = window.innerWidth <= 768;
  }

  responsiveOptions = [
    { breakpoint: '768px', numVisible: 1, numScroll: 1 },
    { breakpoint: '1024px', numVisible: 2, numScroll: 1 }
  ];

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

  increaseQuantity() {
    this.quantity++;
  }

  decreaseQuantity() {
    this.quantity = Math.max(1, this.quantity - 1);
  }

  confirmAddToCart(event: Event) {
    event.stopPropagation();

    if (!this.addToCartBook) return;

    // CartService is typed: accepts book+quantity
    this.cart.addToCart(this.addToCartBook, this.quantity);

    this.showAddToCartDialog = false;
    this.showDetailsDialog = false;

    this.addToCartBook = null;
    this.selectedBook = null;
  }

  addToCart(book: Book) {
    this.openAddToCart(book);
  }
}
