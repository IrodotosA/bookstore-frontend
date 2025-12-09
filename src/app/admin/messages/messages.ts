import { Component, inject, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../services/contact.service';
import { Message } from '../../models/message.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DatePipe
  ],
  templateUrl: './messages.html',
  styleUrls: ['./messages.scss']
})
export class AdminMessages {

  private contactService = inject(ContactService);

  // Reactive state
  messages: Message[] = [];
  filteredMessages: Message[] = [];
  expandedRows: Record<string, boolean> = {};
  searchTerm = '';
  loading = true;

  // Load messages using toSignal
  private messagesSig = toSignal(
    this.contactService.getMessages(),
    { initialValue: [] }
  );

  constructor() {
    effect(() => {
      const data = this.messagesSig();

      // initialValue = [] → avoid triggering while loading
      if (!Array.isArray(data)) return;

      this.messages = data;
      this.filteredMessages = [...data];
      this.loading = false;
    });
  }

  filterMessages() {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredMessages = this.messages.filter(msg =>
      msg.name?.toLowerCase().includes(term) ||
      msg.email?.toLowerCase().includes(term) ||
      msg.subject?.toLowerCase().includes(term)
    );

    this.expandedRows = {};
  }

  expandAll() {
    this.expandedRows = this.messages.reduce((acc, msg) => {
      acc[msg._id] = true;
      return acc;
    }, {} as Record<string, boolean>);
  }

  collapseAll() {
    this.expandedRows = {};
  }

  async deleteMessage(msg: Message) {
    if (!confirm(`Delete message from "${msg.name}"?`)) return;

    try {
      await firstValueFrom(this.contactService.deleteMessage(msg._id));

      // Update local state
      this.messages = this.messages.filter(m => m._id !== msg._id);
      this.filteredMessages = this.filteredMessages.filter(m => m._id !== msg._id);

      delete this.expandedRows[msg._id];
    } catch {
      alert('Failed to delete message.');
    }
  }
}
