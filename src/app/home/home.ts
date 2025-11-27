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
  books: any[] = [];
  featured: any[] = [];
  selectedBook: any = null;
  showDetailsDialog: boolean = false;
  isMobile = false;
  addToCartBook: any = null;
  showAddToCartDialog: boolean = false;
  quantity: number = 1;
  cart = inject(CartService);
  private bookService = inject(BookService);
  apiUrl = environment.apiUrl;

  ngOnInit() {
    this.updateIsMobile();

    window.addEventListener('resize', () => {
      this.updateIsMobile();
    });

    this.bookService.getNewestBooks().subscribe({
      next: (data) => {
        this.books = data; // 4 newest books
      }
    });

    // Staff picks
    this.bookService.getFeaturedBooks().subscribe({
      next: (data) => this.featured = data
    });
  }

  updateIsMobile() {
    this.isMobile = window.innerWidth <= 768;
  }

  responsiveOptions = [
    {
      breakpoint: '768px',   // phones
      numVisible: 1,
      numScroll: 1
    },
    {
      breakpoint: '1024px',  // tablets
      numVisible: 2,
      numScroll: 1
    }
  ];

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

  openAddToCart(book: any) {
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
    this.cart.addToCart(this.addToCartBook, this.quantity);
    // close dialogs
    this.showAddToCartDialog = false;
    this.showDetailsDialog = false;

    // reset
    this.addToCartBook = null;
    this.selectedBook = null;
  }

  addToCart(book: any) {
    this.openAddToCart(book);  // just opens the quantity dialog
  }


}
