import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private cartKey = 'bookstore_cart';
  cartItems: any[] = [];

  constructor() {
    this.loadCart();
  }

  // Load from localStorage
  private loadCart() {
    const saved = localStorage.getItem(this.cartKey);
    this.cartItems = saved ? JSON.parse(saved) : [];
  }

  // Save to localStorage
  private saveCart() {
    localStorage.setItem(this.cartKey, JSON.stringify(this.cartItems));
  }

  // Add or increase quantity
  addToCart(book: any, quantity: number = 1) {

    const existing = this.cartItems.find(item => item._id === book._id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cartItems.push({
        ...book,
        quantity
      });
    }

    this.saveCart();
  }

  // Remove item completely
  removeFromCart(bookId: string) {
    this.cartItems = this.cartItems.filter(item => item._id !== bookId);
    this.saveCart();
  }

  // Update quantity
  updateQuantity(bookId: string, quantity: number) {
    const item = this.cartItems.find(i => i._id === bookId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.saveCart();
    }
  }

  // Clear entire cart
  clearCart() {
    this.cartItems = [];
    this.saveCart();
  }

  // Total items count (for navbar badge)
  getTotalItems() {
    return this.cartItems.reduce((sum, i) => sum + i.quantity, 0);
  }

  // Total price
  getTotalPrice() {
    return this.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }
}