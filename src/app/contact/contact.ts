import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

import { ContactService } from '../services/contact.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    MessageModule
  ],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class Contact {
  fb = inject(FormBuilder);
  contactService = inject(ContactService);

  loading = false;
  success: { ok: boolean; msg: string } | null = null;

  contactForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', Validators.required]
  });

  get f() {
    return this.contactForm.controls;
  }

  async submit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.success = null;

    try {
      await firstValueFrom(this.contactService.sendMessage(this.contactForm.value));

      this.success = { ok: true, msg: 'Message sent successfully!' };
      this.contactForm.reset();

    } catch (err) {
      this.success = { ok: false, msg: 'Something went wrong. Please try again.' };

    } finally {
      this.loading = false;
    }
  }
}
