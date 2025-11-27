import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginResponse {
  token: string;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // adjust if your backend port/path is different
  private apiUrl = environment.apiUrl;

  private authState = new BehaviorSubject<boolean>(this.isLoggedIn());
  authState$ = this.authState.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
    this.authState.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    this.authState.next(false);
  }

  register(data: { name: string; email: string; password: string }) {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, data);
  }

  getUser() {
    const token = this.getToken();
    if (!token) return null;

    try {
      return JSON.parse(atob(token.split('.')[1])); // decode payload
    } catch {
      return null;
    }
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user && user.role === 'admin';
  }
}