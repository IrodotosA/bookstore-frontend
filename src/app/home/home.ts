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
import { firstValueFrom } from 'rxjs';

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

  async ngOnInit() {
    this.updateIsMobile();
    window.addEventListener('resize', () => this.updateIsMobile());

    try {
      // Load newest books
      this.books = await firstValueFrom(this.bookService.getNewestBooks());

      // Load featured books
      this.featured = await firstValueFrom(this.bookService.getFeaturedBooks());

    } catch (err) {
      console.error('Error loading home page books', err);
    }
  }

  updateIsMobile() {
    this.isMobile = window.innerWidth <= 768;
  }

  responsiveOptions = [
    { breakpoint: '768px', numVisible: 1, numScroll: 1 },
    { breakpoint: '1024px', numVisible: 2, numScroll: 1 }
  ];

  async openDetails(book: Book) {
    this.selectedBook = null;
    this.addToCartBook = book;
    this.quantity = 1;
    this.showDetailsDialog = true;

    try {
      this.selectedBook = await firstValueFrom(
        this.bookService.getBookById(book._id)
      );
    } catch (err) {
      console.error('Error loading book details', err);
    }
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
