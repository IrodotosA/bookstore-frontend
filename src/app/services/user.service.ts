import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAllUsers() {
    const token = localStorage.getItem('token');
    return this.http.get<any[]>(this.apiUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  updateUser(id: string, data: any) {
    const token = localStorage.getItem('token');
    return this.http.put(`${this.apiUrl}/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  deleteUser(id: string) {
    const token = localStorage.getItem('token');
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  updateMyProfile(data: any) {
    return this.http.put<any>(`${this.apiUrl}/me`, data);
  }

  changePassword(data: { oldPassword: string; newPassword: string }) {
    return this.http.put<any>(`${this.apiUrl}/change-password`, data);
  }
}
