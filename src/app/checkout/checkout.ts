import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule
  ],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout {
  cart = inject(CartService);
  orderService = inject(OrderService);
  router = inject(Router);
  paymentMethod: string = 'card';

  // Form model
  customer = {
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  };

  testCards = [
    { type: "Visa", number: "4111 1111 1111 1111", name: "John Doe", exp: "12/28", cvv: "123" },
    { type: "Mastercard", number: "5555 5555 5555 4444", name: "John Doe", exp: "12/28", cvv: "123" }
  ];

  card = {
    number: '',
    name: '',
    exp: '',
    cvv: ''
  };

  placeOrder() {
    if (!this.isFormValid() || !this.isCardValid()) {
      alert("Please complete all required fields.");
      return;
    }

    const orderData = {
      items: this.cart.cartItems.map(item => ({
        bookId: item._id,
        title: item.title,
        price: item.price,
        quantity: item.quantity
      })),
      totalPrice: this.total,
      billing: this.customer,
      paymentMethod: this.paymentMethod,
      cardNumber: this.card.number   // backend extracts last 4
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (res) => {
        console.log("Order created:", res);

        // Clear cart after success
        this.cart.clearCart();

        // Navigate to thank you page (we can build this next)
        this.router.navigate(['/order-success']);
      },
      error: (err) => {
        console.error(err);
        alert("Failed to place order.");
      }
    });
  }

  clearCart() {
    this.cart.cartItems;
    localStorage.removeItem('cart');
  }

  isFormValid() {
    return (
      this.customer.name &&
      this.customer.phone &&
      this.customer.address &&
      this.customer.city &&
      this.customer.postalCode &&
      this.customer.country &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.customer.email) &&  // email regex
      /^[0-9+]+$/.test(this.customer.phone) &&                  // phone regex
      /^[0-9]+$/.test(this.customer.postalCode)                // postal code regex
    );
  }

  isCardValid(): boolean {
    if (this.paymentMethod !== 'card') return true; 

    // All fields must be filled
    if (
      !this.card.number ||
      !this.card.name ||
      !this.card.exp ||
      !this.card.cvv
    ) {
      return false;
    }

    const cleanNumber = this.card.number.replace(/\s+/g, '');

    // Must match one of the test cards exactly
    const match = this.testCards.find(c =>
      c.number.replace(/\s+/g, '') === cleanNumber &&
      c.exp === this.card.exp &&
      c.cvv === this.card.cvv
    );

    return !!match; 
  }

  get items() {
    return this.cart.cartItems;
  }

  get total() {
    return this.cart.getTotalPrice();
  }
}