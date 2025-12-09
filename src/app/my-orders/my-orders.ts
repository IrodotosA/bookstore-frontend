import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { OrderService } from '../services/order.service';
import { AccordionModule } from 'primeng/accordion';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';

import { Order } from '../models/order.model';
import { firstValueFrom } from 'rxjs';

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
  
  private orderService = inject(OrderService);
  private auth = inject(AuthService);
  private router = inject(Router);

  orders: Order[] = [];
  loading = true;

  async ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], {
        queryParams: { redirectTo: '/my-orders' }
      });
      return;
    }

    try {
      this.orders = await firstValueFrom(this.orderService.getMyOrders());
    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  getStatusSeverity(status: Order['status']) {
    switch (status) {
      case 'pending': return 'warn';
      case 'shipped': return 'info';
      case 'completed': return 'success';
      case 'canceled': return 'danger';
      default: return null;
    }
  }

  async cancel(orderId: string) {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      const updated = await firstValueFrom(this.orderService.cancelOrder(orderId));

      const order = this.orders.find(o => o._id === updated._id);
      if (order) order.status = updated.status;

    } catch (err) {
      console.error(err);
      alert('Failed to cancel order.');
    }
  }
}
