import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  TableModule,
  TableRowCollapseEvent,
  TableRowExpandEvent
} from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';

import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

import { FormsModule } from '@angular/forms';

import { OrderService } from '../../services/order.service';
import { Order, OrderItem, OrderStatus, PaymentMethod } from '../../models/order.model';

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
    MessageModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class AdminOrders implements OnInit {

  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);

  selectedOrder: Order | null = null;
  orders: Order[] = [];
  filteredOrders: Order[] = [];

  loading = true;
  searchTerm: string = '';

  expandedRows: Record<string, boolean> = {};
  orderDialog = false;

  // REACTIVE FORM
  orderForm!: FormGroup;

  paymentMethods: { label: string; value: PaymentMethod }[] = [
    { label: 'Credit Card', value: 'card' },
    { label: 'Cash on Delivery', value: 'cod' },
    { label: 'PayPal', value: 'paypal' }
  ];

  statuses: { label: string; value: OrderStatus }[] = [
    { label: 'Pending', value: 'pending' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Completed', value: 'completed' },
    { label: 'Canceled', value: 'canceled' }
  ];

  ngOnInit() {
    this.loadOrders();
    this.initEmptyForm();
  }

  // -----------------------------
  // EMPTY ORDER FORM
  // -----------------------------
  initEmptyForm() {
    this.orderForm = this.fb.group({
      billing: this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        address: ['', Validators.required],
        city: ['', Validators.required],
        postalCode: ['', Validators.required],
        country: ['', Validators.required]
      }),
      items: this.fb.array([], {
        validators: [AdminOrders.atLeastOneItem()]
      }),
      paymentMethod: ['', Validators.required],
      status: ['', Validators.required],
      totalPrice: [0]
    });
  }

  static atLeastOneItem(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const fa = control as FormArray;
      return fa.length > 0 ? null : { noItems: true };
    };
  }

  get billing() {
    return this.orderForm.get('billing') as FormGroup;
  }

  get itemsArray(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  createItem(item?: OrderItem): FormGroup {
    return this.fb.group({
      title: [item?.title || '', Validators.required],
      quantity: [item?.quantity || 1, [Validators.required, Validators.min(1)]],
      price: [item?.price || 0, [Validators.required, Validators.min(0)]]
    });
  }

  // -----------------------------
  // LOAD ORDERS
  // -----------------------------
  loadOrders() {
    this.orderService.getAllOrders().subscribe({
      next: (data: Order[]) => {
        this.orders = data;
        this.filteredOrders = data;
        this.loading = false;
      },
      error: (err) => console.error(err)
    });
  }

  // -----------------------------
  // SEARCH
  // -----------------------------
  filterOrders() {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredOrders = this.orders.filter(order =>
      order._id.toLowerCase().includes(term) ||
      order.billing?.email?.toLowerCase().includes(term)
    );

    this.expandedRows = {};
  }

  expandAll() {
    this.expandedRows = this.orders.reduce((acc, order) => {
      acc[order._id] = true;
      return acc;
    }, {} as Record<string, boolean>);
  }

  collapseAll() {
    this.expandedRows = {};
  }

  onRowExpand(event: TableRowExpandEvent) {}
  onRowCollapse(event: TableRowCollapseEvent) {}

  // -----------------------------
  // OPEN EDIT POPUP
  // -----------------------------
  openEdit(order: Order) {
    this.selectedOrder = order;

    this.orderForm.reset();
    this.itemsArray.clear();

    this.orderForm.patchValue({
      billing: order.billing,
      paymentMethod: order.paymentMethod,
      status: order.status,
      totalPrice: order.totalPrice
    });

    order.items.forEach(item => {
      this.itemsArray.push(this.createItem(item));
    });

    this.setupAutoTotalCalculation();

    this.orderDialog = true;
  }

  // -----------------------------
  // AUTO TOTAL PRICE
  // -----------------------------
  setupAutoTotalCalculation() {
    this.itemsArray.valueChanges.subscribe(() => {
      const total = this.itemsArray.controls.reduce((sum, ctrl) => {
        const price = ctrl.get('price')?.value ?? 0;
        const quantity = ctrl.get('quantity')?.value ?? 0;
        return sum + price * quantity;
      }, 0);

      this.orderForm.patchValue({ totalPrice: total }, { emitEvent: false });
    });
  }

  removeItem(index: number) {
    this.itemsArray.removeAt(index);
  }

  // -----------------------------
  // SAVE ORDER
  // -----------------------------
  saveOrder() {
    if (!this.selectedOrder) return;

    this.orderService
      .updateOrderFull(this.selectedOrder._id, this.orderForm.value)
      .subscribe({
        next: (updated: Order) => {
          const idx = this.orders.findIndex(o => o._id === updated._id);
          if (idx !== -1) this.orders[idx] = updated;
          this.orderDialog = false;
        },
        error: (err) => console.error(err)
      });
  }

  hideDialog() {
    this.orderDialog = false;
  }

  // -----------------------------
  // STATUS COLOR
  // -----------------------------
  getStatusSeverity(status: OrderStatus) {
    switch (status) {
      case 'pending': return 'warn';
      case 'shipped': return 'info';
      case 'completed': return 'success';
      case 'canceled': return 'danger';
      default: return null;
    }
  }

  // -----------------------------
  // DELETE ORDER
  // -----------------------------
  deleteOrder(order: Order) {
    if (!confirm('Delete this order?')) return;

    this.orderService.deleteOrder(order._id).subscribe({
      next: () => {
        this.orders = this.orders.filter(o => o._id !== order._id);
        this.filteredOrders = this.filteredOrders.filter(o => o._id !== order._id);
        delete this.expandedRows[order._id];
      },
      error: (err) => console.error(err)
    });
  }
}
