import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { LoginResponse } from '../models/login-response.model';
import { RegisterResponse } from '../models/register-response.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  // 🔥 NEW: Reactive user state
  private userSubject = new BehaviorSubject<User | null>(this.getUser());
  user$ = this.userSubject.asObservable();

  private authState = new BehaviorSubject<boolean>(this.isLoggedIn());
  authState$ = this.authState.asObservable();

  constructor(private http: HttpClient) {}

  // ----------------------------
  // LOGIN
  // ----------------------------
  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials);
  }

  // ----------------------------
  // REGISTER
  // ----------------------------
  register(data: { name: string; email: string; password: string }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register`, data);
  }

  // ----------------------------
  // TOKEN
  // ----------------------------
  saveToken(token: string) {
    localStorage.setItem('token', token);
    this.authState.next(true);

    // 🔥 also refresh user state from the new token
    this.userSubject.next(this.getUser());
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ----------------------------
  // USER MANAGEMENT
  // ----------------------------
  getUser(): User | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload as User;
    } catch {
      return null;
    }
  }

  // 🔥 NEW: Set user after updateMe()
  setUser(user: User) {
    this.userSubject.next(user);
  }

  // ----------------------------
  // HELPERS
  // ----------------------------
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    this.userSubject.next(null); // clear user
    this.authState.next(false);
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin';
  }
}
