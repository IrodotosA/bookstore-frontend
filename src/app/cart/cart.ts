import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { CartService } from '../services/cart.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, ButtonModule, InputNumberModule, FormsModule, RouterModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart {
  cart = inject(CartService);

  increaseQty(item: any) {
    item.quantity = item.quantity + 1;
    this.cart.updateQuantity(item._id, item.quantity);
  }

  decreaseQty(item: any) {
    item.quantity = Math.max(1, item.quantity - 1);
    this.cart.updateQuantity(item._id, item.quantity);
  }

  manualQtyChange(item: any) {
    // Called when typing in the input box
    item.quantity = Math.max(1, item.quantity);
    this.cart.updateQuantity(item._id, item.quantity);
  }

  removeItem(id: string) {
    this.cart.removeFromCart(id);
  }

  get items() {
    return this.cart.cartItems;
  }

  get totalPrice() {
    return this.cart.getTotalPrice();
  }
}