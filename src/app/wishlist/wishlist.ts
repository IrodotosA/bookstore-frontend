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
import { FormsModule } from '@angular/forms';

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

  books: any[] = [];
  loading = true;

  // Dialog-related variables
  selectedBook: any = null;
  showDetailsDialog: boolean = false;

  addToCartBook: any = null;
  showAddToCartDialog: boolean = false;

  quantity = 1;

  ngOnInit() {
    // subscribe to wishlist ID changes
    this.wishlist.wishlist$.subscribe(ids => {
      if (ids.length === 0) {
        this.books = [];
        this.loading = false;
        return;
      }

      this.bookService.getAllBooks().subscribe({
        next: allBooks => {
          this.books = allBooks.filter(b => ids.includes(b._id));
          this.loading = false;
        },
        error: () => this.loading = false
      });
    });
  }

  // DETAILS DIALOG
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

  // ADD TO CART DIALOG
  openAddToCart(book: any) {
    this.addToCartBook = book;
    this.quantity = 1;
    this.showAddToCartDialog = true;
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


  increaseQuantity() {
    this.quantity = this.quantity + 1;
  }

  decreaseQuantity() {
    this.quantity = Math.max(1, this.quantity - 1);
  }

  remove(book: any) {
    this.wishlist.remove(book._id).subscribe();
  }

  toggleWishlist(book: any) {
    this.wishlist.toggle(book._id).subscribe();
  }

  isInWishlist(id: string) {
    return this.wishlist.isInWishlist(id);
  }

  goToShop() {
    this.router.navigate(['/shop']);
  }
}
