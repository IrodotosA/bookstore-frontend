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

import { FormsModule } from '@angular/forms'; // kept only for search bar
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
    MessageModule,
    ReactiveFormsModule, // FULL REACTIVE FORM
    FormsModule // kept for search bar only
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class AdminOrders implements OnInit {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);

  selectedOrder: any | null = null;
  orders: any[] = [];
  loading = true;
  searchTerm: string = '';
  filteredOrders: any[] = [];

  expandedRows: { [key: string]: boolean } = {};
  orderDialog = false;

  // ⭐ FULL REACTIVE ORDER FORM
  orderForm!: FormGroup;

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

  ngOnInit() {
    this.loadOrders();
    this.initEmptyForm();
  }

  // -----------------------------
  // INITIAL EMPTY FORM
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

  // GET ARRAY ACCESSOR
  get itemsArray(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  // CREATE A NEW ITEM FORM GROUP
  createItem(item?: any): FormGroup {
    return this.fb.group({
      title: [item?.title || '', Validators.required],
      quantity: [
        item?.quantity || 1,
        [Validators.required, Validators.min(1)]
      ],
      price: [
        item?.price || 0,
        [Validators.required, Validators.min(0)]
      ]
    });
  }

  // -----------------------------
  // LOADING ORDERS
  // -----------------------------
  loadOrders() {
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
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

    this.filteredOrders = this.orders.filter((order) => {
      const idMatch = order._id.toLowerCase().includes(term);
      const emailMatch = order.billing?.email?.toLowerCase().includes(term);
      return idMatch || emailMatch;
    });

    this.expandedRows = {};
  }

  expandAll() {
    this.expandedRows = this.orders.reduce((acc, order) => {
      acc[order._id] = true;
      return acc;
    }, {});
  }

  collapseAll() {
    this.expandedRows = {};
  }

  onRowExpand(event: TableRowExpandEvent) {}
  onRowCollapse(event: TableRowCollapseEvent) {}

  // -----------------------------
  // OPEN EDIT DIALOG
  // -----------------------------
  openEdit(order: any) {
    this.selectedOrder = order;

    this.orderForm.reset();
    this.itemsArray.clear();

    // PATCH BILLING
    this.orderForm.patchValue({
      billing: order.billing || {},
      paymentMethod: order.paymentMethod || '',
      status: order.status || '',
      totalPrice: order.totalPrice || 0
    });

    // PATCH ITEMS ARRAY
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        this.itemsArray.push(this.createItem(item));
      });
    }

    this.setupAutoTotalCalculation();

    this.orderDialog = true;
  }

  //--------------------------------
  // AUTO RE-CALCULATE TOTAL PRICE
  //--------------------------------
  setupAutoTotalCalculation() {
    this.itemsArray.valueChanges.subscribe(() => {
      const total = this.itemsArray.controls.reduce((sum, group: any) => {
        const price = group.get('price')?.value || 0;
        const quantity = group.get('quantity')?.value || 0;
        return sum + price * quantity;
      }, 0);

      this.orderForm.patchValue({ totalPrice: total }, { emitEvent: false });
    });
  }

  //--------------------------------
  // REMOVE ITEM
  //--------------------------------
  removeItem(index: number) {
    this.itemsArray.removeAt(index);
  }

  //--------------------------------
  // SAVE ORDER
  //--------------------------------
  saveOrder() {
    if (!this.selectedOrder) return;

    const payload = this.orderForm.value;

    this.orderService
      .updateOrderFull(this.selectedOrder._id, payload)
      .subscribe({
        next: (res) => {
          const idx = this.orders.findIndex((o) => o._id === res._id);
          if (idx !== -1) this.orders[idx] = res;

          this.orderDialog = false;
        },
        error: (err) => console.error(err)
      });
  }

  //--------------------------------
  // CLOSE DIALOG
  //--------------------------------
  hideDialog() {
    this.orderDialog = false;
  }

  //--------------------------------
  // TAG COLOR
  //--------------------------------
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

  deleteOrder(order: any) {
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
