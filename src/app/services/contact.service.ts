import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private apiUrl = 'http://localhost:4000/contact';

  constructor(private http: HttpClient) {}

  sendMessage(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  getMessages() {
    return this.http.get<any[]>(this.apiUrl);
  }

  deleteMessage(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}