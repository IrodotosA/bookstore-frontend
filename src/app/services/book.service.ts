import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BookService {
  private apiUrl = 'http://localhost:4000/books';

  constructor(private http: HttpClient) {}

  getLatestBooks(limit: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?limit=${limit}`);
  }

  getAllBooks() {
    return this.http.get<any[]>(this.apiUrl);
  }

  getBookById(id: string) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

    // 🔹 Create book (admin)
  createBook(bookData: any): Observable<any> {
    const token = localStorage.getItem('token');

    return this.http.post(this.apiUrl, bookData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 🔹 Update book (admin)
  updateBook(id: string, bookData: any): Observable<any> {
    const token = localStorage.getItem('token');

    return this.http.put(`${this.apiUrl}/${id}`, bookData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  getFeaturedBooks() {
    return this.http.get<any[]>(`${this.apiUrl}/featured`);
  }
  
  updateFeatured(id: string, featured: boolean) {
    return this.http.patch<any>(`${this.apiUrl}/${id}/featured`, { featured });
  }

  getNewestBooks() {
    return this.http.get<any[]>(`${this.apiUrl}/newest`);
  }

  // 🔹 Delete book (admin)
  deleteBook(id: string): Observable<any> {
    const token = localStorage.getItem('token');

    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}