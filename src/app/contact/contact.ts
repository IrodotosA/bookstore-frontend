import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';

import { ContactService } from '../services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    TextareaModule,
    ButtonModule
  ],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class Contact {

  name = '';
  email = '';
  subject = '';
  message = '';

  success: { ok: boolean; msg: string } | null = null;
  loading = false;

  constructor(private contactService: ContactService) {}

  submit() {
    if (!this.name || !this.email || !this.subject || !this.message) {
      this.success = { ok: false, msg: 'All fields are required.' };
      return;
    }

    this.loading = true;

    this.contactService.sendMessage({
      name: this.name,
      email: this.email,
      subject: this.subject,
      message: this.message
    }).subscribe({
      next: () => {
        this.success = { ok: true, msg: 'Message sent successfully!' };

        // Reset form
        this.name = '';
        this.email = '';
        this.subject = '';
        this.message = '';
        this.loading = false;
      },
      error: () => {
        this.success = {
          ok: false,
          msg: 'Something went wrong. Please try again.'
        };
        this.loading = false;
      }
    });
  }
}