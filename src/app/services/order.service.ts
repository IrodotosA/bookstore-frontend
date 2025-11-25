import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:4000/orders';

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
}