import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

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

  private getAuthHeaders() {
    const token = this.auth.getToken();
    return {
      Authorization: `Bearer ${token}`
    };
  }

    loadWishlist(): Observable<string[]> {
    const token = this.auth.getToken();

    if (!token) {
        this.wishlistItems = [];
        this._wishlist$.next([]);
        return of([]);
    }

    return this.http.get<any[]>(this.apiUrl, {
        headers: this.getAuthHeaders()
    }).pipe(
        // convert array of book objects → array of IDs
        map(items => items.map(item => item._id)),
        tap(ids => {
        this.wishlistItems = ids;
        this._wishlist$.next(ids);
        })
    );
    }

  isInWishlist(bookId: string): boolean {
    return this.wishlistItems.includes(bookId);
  }

    toggle(bookId: string): Observable<any> {
        if (this.isInWishlist(bookId)) {
            return this.remove(bookId);
        }

        return this.add(bookId);
    }

    add(bookId: string): Observable<any> {
        return this.http.post<any>(
            `${this.apiUrl}/add`,
            { bookId },
            { headers: this.getAuthHeaders() }
        ).pipe(
            tap((res) => {
            this.wishlistItems.push(bookId);
            this._wishlist$.next(this.wishlistItems);
            })
        );
    }

    remove(bookId: string): Observable<any> {
        return this.http.delete<any>(
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
