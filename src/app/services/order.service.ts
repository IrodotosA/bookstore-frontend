import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  createOrder(orderData: any): Observable<any> {
    const token = localStorage.getItem('token');

    return this.http.post(this.apiUrl, orderData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  getMyOrders() {
    const token = localStorage.getItem('token');

    return this.http.get<any[]>(this.apiUrl + '/my', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  cancelOrder(orderId: string) {
    const token = localStorage.getItem('token');

    return this.http.put(
      `${this.apiUrl}/cancel/${orderId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
  }

  getAllOrders() {
    const token = localStorage.getItem('token');
    return this.http.get<any[]>(this.apiUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  updateOrderStatus(id: string, status: string) {
    const token = localStorage.getItem('token');
    return this.http.put(`${this.apiUrl}/${id}`, { status }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  updateOrderFull(id: string, payload: any) {
    const token = localStorage.getItem('token');
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  deleteOrder(id: string) {
    const token = localStorage.getItem('token');
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}