import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';
import { Book } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private apiUrl = `${environment.apiUrl}/wishlist`;

  private _wishlist$ = new BehaviorSubject<string[]>([]);
  public wishlist$ = this._wishlist$.asObservable();

  wishlistItems: string[] = [];

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken() ?? '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // -------------------------------------------
  // LOAD WISHLIST (returns Book[] → store IDs)
  // -------------------------------------------
  loadWishlist(): Observable<string[]> {
    const token = this.auth.getToken();

    if (!token) {
      this.wishlistItems = [];
      this._wishlist$.next([]);
      return of([]);
    }

    return this.http.get<Book[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((books) => books.map(b => b._id)),
      tap((ids) => {
        this.wishlistItems = ids;
        this._wishlist$.next(ids);
      })
    );
  }

  isInWishlist(bookId: string): boolean {
    return this.wishlistItems.includes(bookId);
  }

  toggle(bookId: string): Observable<unknown> {
    return this.isInWishlist(bookId)
      ? this.remove(bookId)
      : this.add(bookId);
  }

  add(bookId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/add`,
      { bookId },
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(() => {
        this.wishlistItems.push(bookId);
        this._wishlist$.next(this.wishlistItems);
      })
    );
  }

  remove(bookId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/remove/${bookId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(() => {
        this.wishlistItems = this.wishlistItems.filter(id => id !== bookId);
        this._wishlist$.next(this.wishlistItems);
      })
    );
  }

  clearAll(): Observable<boolean> {
    this.wishlistItems = [];
    this._wishlist$.next([]);
    return of(true);
  }
}