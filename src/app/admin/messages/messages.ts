import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../services/contact.service';
import { Message } from '../../models/message.model';

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
export class AdminMessages implements OnInit {

  private contactService = inject(ContactService);

  messages: Message[] = [];
  filteredMessages: Message[] = [];
  expandedRows: Record<string, boolean> = {};
  searchTerm = '';
  loading = true;

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    this.loading = true;

    this.contactService.getMessages().subscribe({
      next: (data: Message[]) => {
        this.messages = data;
        this.filteredMessages = data;
        this.loading = false;
      },
      error: () => {
        alert('Failed to load messages.');
        this.loading = false;
      }
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

  deleteMessage(msg: Message) {
    if (!confirm(`Delete message from "${msg.name}"?`)) return;

    this.contactService.deleteMessage(msg._id).subscribe({
      next: () => {
        this.messages = this.messages.filter(m => m._id !== msg._id);
        this.filteredMessages = this.filteredMessages.filter(m => m._id !== msg._id);
      },
      error: () => alert('Failed to delete message.')
    });
  }
}
