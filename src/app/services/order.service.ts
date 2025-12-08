import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { Order } from '../models/order.model';
import { CreateOrderDto } from '../models/create-order.dto';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  // Helper for token headers
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // -------------------------------------------------------
  // CREATE ORDER (Public checkout)
  // -------------------------------------------------------
  createOrder(orderData: CreateOrderDto): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, orderData, {
      headers: this.getAuthHeaders()
    });
  }

  // -------------------------------------------------------
  // USER'S OWN ORDERS
  // -------------------------------------------------------
  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/my`, {
      headers: this.getAuthHeaders()
    });
  }

  cancelOrder(orderId: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/cancel/${orderId}`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  // -------------------------------------------------------
  // ADMIN ROUTES
  // -------------------------------------------------------
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  updateOrderStatus(id: string, status: Order['status']): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}`, { status }, {
      headers: this.getAuthHeaders()
    });
  }

  updateOrderFull(id: string, payload: Partial<Order>): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  deleteOrder(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
