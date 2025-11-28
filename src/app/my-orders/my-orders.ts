import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { OrderService } from '../services/order.service';
import { AccordionModule } from 'primeng/accordion';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [
    CommonModule,
    AccordionModule,
    CardModule,
    TagModule,
    ButtonModule,
    RouterModule,
    DecimalPipe
  ],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.scss'
})
export class MyOrders implements OnInit {
  orderService = inject(OrderService);
  auth = inject(AuthService);
  router = inject(Router);

  orders: any[] = [];
  loading = true;

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { redirectTo: '/my-orders' } });
      return;
    }

    this.orderService.getMyOrders().subscribe({
      next: (res) => {
        this.orders = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  getStatusSeverity(status: string) {
    switch (status) {
      case 'pending':
        return 'warn';
      case 'shipped':
        return 'info';
      case 'completed':
        return 'success';
      case 'canceled': 
        return 'danger';
      default:
        return null;
    }
  }

  cancel(orderId: string) {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    this.orderService.cancelOrder(orderId).subscribe({
      next: (res) => {
        // Update local UI
        const order = this.orders.find(o => o._id === orderId);
        if (order) order.status = "canceled";
      },
      error: (err) => {
        console.error(err);
        alert("Failed to cancel order.");
      }
    });
  }
}