import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Message } from '../models/message.model'; 

@Injectable({ providedIn: 'root' })
export class ContactService {
  private apiUrl = `${environment.apiUrl}/contact`;

  constructor(private http: HttpClient) {}

  // -----------------------------------------------------
  // PUBLIC: Send a message
  // -----------------------------------------------------
  sendMessage(data: Omit<Message, '_id' | 'createdAt'>): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.apiUrl, data);
  }

  // -----------------------------------------------------
  // ADMIN: Get all contact messages
  // -----------------------------------------------------
  getMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(this.apiUrl);
  }

  // -----------------------------------------------------
  // ADMIN: Delete message
  // -----------------------------------------------------
  deleteMessage(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
