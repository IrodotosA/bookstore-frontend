import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { Book } from '../models/book.model';

@Injectable({ providedIn: 'root' })
export class BookService {
  private apiUrl = `${environment.apiUrl}/books`;

  constructor(private http: HttpClient) {}

  // Helper for authorization headers
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // ----------------------------------------------------
  // PUBLIC ROUTES
  // ----------------------------------------------------

  getLatestBooks(limit: number): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}?limit=${limit}`);
  }

  getAllBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl);
  }

  getBookById(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${id}`);
  }

  getFeaturedBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/featured`);
  }

  getNewestBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/newest`);
  }

  // ----------------------------------------------------
  // ADMIN ROUTES
  // ----------------------------------------------------

  createBook(bookData: FormData): Observable<Book> {
    return this.http.post<Book>(this.apiUrl, bookData, {
      headers: this.getAuthHeaders()
    });
  }

  updateBook(id: string, bookData: FormData): Observable<Book> {
    return this.http.put<Book>(`${this.apiUrl}/${id}`, bookData, {
      headers: this.getAuthHeaders()
    });
  }

  updateFeatured(id: string, featured: boolean): Observable<Book> {
    return this.http.patch<Book>(`${this.apiUrl}/${id}/featured`, { featured }, {
      headers: this.getAuthHeaders()
    });
  }

  deleteBook(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
