import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse } from '../models/auth-response.model';
import { User, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  // Helper for token headers
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // ---------------------------------------
  // GET ALL USERS
  // ---------------------------------------
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  // ---------------------------------------
  // UPDATE USER (Admin updating another user)
  // ---------------------------------------
  updateUser(id: string, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  // ---------------------------------------
  // DELETE USER
  // ---------------------------------------
  deleteUser(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // ---------------------------------------
  // USER UPDATES HIS OWN PROFILE
  // ---------------------------------------
  updateMyProfile(data: Partial<User>): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(`${this.apiUrl}/me`, data, {
      headers: this.getAuthHeaders()
    });
  }

  // ---------------------------------------
  // CHANGE PASSWORD
  // ---------------------------------------
  changePassword(data: { oldPassword: string; newPassword: string }): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/change-password`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }
}
