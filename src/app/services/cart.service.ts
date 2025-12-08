import { Injectable } from '@angular/core';
import { CartItem } from '../models/cart-item.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private cartKey = 'bookstore_cart';
  cartItems: CartItem[] = [];

  constructor() {
    this.loadCart();
  }

  // --------------------------------------------------
  // Load from localStorage
  // --------------------------------------------------
  private loadCart(): void {
    const saved = localStorage.getItem(this.cartKey);
    this.cartItems = saved ? JSON.parse(saved) as CartItem[] : [];
  }

  // --------------------------------------------------
  // Save to localStorage
  // --------------------------------------------------
  private saveCart(): void {
    localStorage.setItem(this.cartKey, JSON.stringify(this.cartItems));
  }

  // --------------------------------------------------
  // Add or increase quantity
  // --------------------------------------------------
  addToCart(book: Omit<CartItem, 'quantity'>, quantity: number = 1): void {
    const existing = this.cartItems.find(item => item._id === book._id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      const newItem: CartItem = {
        ...book,
        quantity
      };
      this.cartItems.push(newItem);
    }

    this.saveCart();
  }

  // --------------------------------------------------
  // Remove item
  // --------------------------------------------------
  removeFromCart(bookId: string): void {
    this.cartItems = this.cartItems.filter(item => item._id !== bookId);
    this.saveCart();
  }

  // --------------------------------------------------
  // Update quantity
  // --------------------------------------------------
  updateQuantity(bookId: string, quantity: number): void {
    const item = this.cartItems.find(i => i._id === bookId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.saveCart();
    }
  }

  // --------------------------------------------------
  // Clear all
  // --------------------------------------------------
  clearCart(): void {
    this.cartItems = [];
    this.saveCart();
  }

  // --------------------------------------------------
  // Total items count
  // --------------------------------------------------
  getTotalItems(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  // --------------------------------------------------
  // Total price
  // --------------------------------------------------
  getTotalPrice(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}
