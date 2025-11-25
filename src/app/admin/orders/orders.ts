import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, TableRowCollapseEvent, TableRowExpandEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    SelectModule,
    TagModule,
    InputNumberModule,
    InputTextModule,
    DialogModule,
    FormsModule
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class AdminOrders implements OnInit {
  private orderService = inject(OrderService);
  selectedOrder: any | null = null;
  orders: any[] = [];
  loading = true;

  // 👇 IMPORTANT: used by [expandedRowKeys]
  expandedRows: { [key: string]: boolean } = {};
  orderDialog = false;

  form: any = {
    billing: {},
    items: [],
    paymentMethod: '',
    status: '',
    totalPrice: 0
  };

  paymentMethods = [
    { label: 'Credit Card', value: 'card' },
    { label: 'Cash on Delivery', value: 'cod' },
    { label: 'PayPal', value: 'paypal' }
  ];

  statuses = [
    { label: 'Pending', value: 'pending' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Completed', value: 'completed' },
    { label: 'Canceled', value: 'canceled' }
  ];
  

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

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: (err) => console.error(err)
    });
  }

  expandAll() {
    this.expandedRows = this.orders.reduce((acc, order) => {
      acc[order._id] = true;
      return acc;
    }, {} as { [key: string]: boolean });
  }

  collapseAll() {
    this.expandedRows = {};
  }

  onRowExpand(event: TableRowExpandEvent) {
    console.log('Expanded:', event.data);
  }

  onRowCollapse(event: TableRowCollapseEvent) {
    console.log('Collapsed:', event.data);
  }

  openEdit(order: any) {
    this.selectedOrder = order;

    // deep copy
    this.form = JSON.parse(JSON.stringify(order));

    // safety: ensure billing exists
    this.form.billing = this.form.billing || {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      country: ''
    };

    // ensure items array exists
    this.form.items = this.form.items || [];

    this.orderDialog = true;
  }

  // addItem() {
  //   this.form.items.push({
  //     title: '',
  //     price: 0,
  //     quantity: 1
  //   });
  //   this.calculateTotal();
  // }

  removeItem(index: number) {
    this.form.items.splice(index, 1);
    this.calculateTotal();
  }

  calculateTotal() {
    this.form.totalPrice = this.form.items.reduce(
      (sum: number, item: any) => sum + (item.price * item.quantity),
      0
    );
  }

  hideDialog() {
    this.orderDialog = false;
  }

  saveOrder() {
    const updated = this.form;

    this.orderService.updateOrderFull(this.form._id, updated).subscribe({
      next: (res) => {

        const idx = this.orders.findIndex(o => o._id === res._id);
        if (idx !== -1) {
          this.orders[idx] = res;
        }

        this.orderDialog = false;
      },
      error: (err) => console.error(err)
    });
  }


  updateStatus(order: any) {
    this.orderService.updateOrderStatus(order._id, order.status).subscribe({
      next: () => console.log('Order updated'),
      error: (err) => console.error(err)
    });
  }

  deleteOrder(order: any) {
    if (!confirm('Delete this order?')) return;

    this.orderService.deleteOrder(order._id).subscribe({
      next: () => {
        this.orders = this.orders.filter(o => o._id !== order._id);
      },
      error: (err) => console.error(err)
    });
  }
}
