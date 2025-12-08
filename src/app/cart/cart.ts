import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';

import { CartService } from '../services/cart.service';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

import { CartItem } from '../models/cart-item.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    InputNumberModule,
    FormsModule,
    RouterModule,
    DialogModule
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart {
  cart = inject(CartService);
  auth = inject(AuthService);
  router = inject(Router);

  showLoginDialog = false;
  apiUrl = environment.apiUrl;

  handleCheckout() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/checkout']);
    } else {
      this.showLoginDialog = true;
    }
  }

  increaseQty(item: CartItem) {
    const newQty = item.quantity + 1;
    item.quantity = newQty;
    this.cart.updateQuantity(item._id, newQty);
  }

  decreaseQty(item: CartItem) {
    const newQty = Math.max(1, item.quantity - 1);
    item.quantity = newQty;
    this.cart.updateQuantity(item._id, newQty);
  }

  manualQtyChange(item: CartItem) {
    const newQty = Math.max(1, item.quantity);
    item.quantity = newQty;
    this.cart.updateQuantity(item._id, newQty);
  }

  removeItem(id: string) {
    this.cart.removeFromCart(id);
  }

  get items(): CartItem[] {
    return this.cart.cartItems;
  }

  get totalPrice(): number {
    return this.cart.getTotalPrice();
  }

  emptyCart() {
    this.cart.clearCart();
  }
}
