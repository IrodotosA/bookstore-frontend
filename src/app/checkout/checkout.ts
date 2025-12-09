import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { firstValueFrom } from 'rxjs';

import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    MessageModule
  ],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout {
  cart = inject(CartService);
  orderService = inject(OrderService);
  router = inject(Router);
  fb = inject(FormBuilder);

  testCards = [
    { type: "Visa", number: "4111 1111 1111 1111", name: "John Doe", exp: "12/28", cvv: "123" },
    { type: "Mastercard", number: "5555 5555 5555 4444", name: "John Doe", exp: "12/28", cvv: "123" }
  ];

  checkoutForm!: FormGroup;

  ngOnInit() {
    this.checkoutForm = this.fb.group(
      {
        customer: this.fb.group({
          name: ['', Validators.required],
          email: ['', [Validators.required, Validators.email]],
          phone: ['', [Validators.required, Validators.pattern(/^[0-9+]+$/)]],
          address: ['', Validators.required],
          city: ['', Validators.required],
          postalCode: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
          country: ['', Validators.required],
        }),

        paymentMethod: ['card', Validators.required],

        card: this.fb.group({
          number: [''],
          name: [''],
          exp: [''],
          cvv: ['']
        })
      },
      { validators: [this.cardValidator()] }
    );
  }

  // --- Custom card validator ---
  cardValidator() {
    return (group: AbstractControl): ValidationErrors | null => {
      const payMethod = group.get('paymentMethod')?.value;
      if (payMethod !== 'card') return null;

      const number = group.get('card.number')?.value?.trim();
      const name = group.get('card.name')?.value?.trim();
      const exp = group.get('card.exp')?.value?.trim();
      const cvv = group.get('card.cvv')?.value?.trim();

      if (!number || !name || !exp || !cvv) {
        return { cardIncomplete: true };
      }

      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp)) {
        return { invalidExpFormat: true };
      }

      const match = this.testCards.find(
        c =>
          c.number.replace(/\s+/g, '') === number.replace(/\s+/g, '') &&
          c.exp === exp &&
          c.cvv === cvv
      );

      return match ? null : { invalidCard: true };
    };
  }

  // Getters
  get f() { return this.checkoutForm; }
  get customer() { return this.f.get('customer') as FormGroup; }
  get card() { return this.f.get('card') as FormGroup; }

  async placeOrder() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    const data = this.checkoutForm.value;

    const orderData = {
      items: this.cart.cartItems.map(item => ({
        bookId: item._id,
        title: item.title,
        price: item.price,
        quantity: item.quantity
      })),
      totalPrice: this.cart.getTotalPrice(),
      billing: data.customer,
      paymentMethod: data.paymentMethod,
      cardNumber: data.card.number // backend extracts last 4
    };

    try {
      await firstValueFrom(this.orderService.createOrder(orderData));
      this.cart.clearCart();
      this.router.navigate(['/order-success']);

    } catch (err) {
      alert("Order failed.");
    }
  }

  get items() {
    return this.cart.cartItems;
  }

  get total() {
    return this.cart.getTotalPrice();
  }
}
