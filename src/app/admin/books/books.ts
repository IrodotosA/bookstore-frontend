import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { BookService } from '../../services/book.service';
import { environment } from '../../../environments/environment';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-admin-books',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    ToggleButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    MessageModule,
    DecimalPipe
  ],
  templateUrl: './books.html',
  styleUrl: './books.scss'
})
export class AdminBooks implements OnInit {
  private bookService = inject(BookService);
  private fb = inject(FormBuilder);

  apiUrl = environment.apiUrl;

  books: Book[] = [];
  filteredBooks: Book[] = [];

  loading = true;
  selectedFile: File | null = null;
  previewImage: string | null = null;

  expandedRows: Record<string, boolean> = {};
  searchTerm: string = '';

  // Dialog state
  bookDialog = false;
  isEditMode = false;
  selectedBook: Book | null = null;

  // Reactive form for book create/edit
  bookForm!: FormGroup;

  ngOnInit() {
    this.initForm();
    this.loadBooks();
  }

  private initForm() {
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      category: ['', Validators.required],
      price: [
        0,
        [Validators.required, Validators.min(0.01)]
      ],
      description: ['']
    });
  }

  loadBooks() {
    this.loading = true;
    this.bookService.getAllBooks().subscribe({
      next: (data: Book[]) => {
        this.books = data;
        this.filteredBooks = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  resetFormState() {
    this.selectedFile = null;
    this.previewImage = null;

    const fileInput = document.getElementById('book-image-input') as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';
  }

  filterBooks() {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredBooks = this.books.filter((b) =>
      b.title?.toLowerCase().includes(term) ||
      b.author?.toLowerCase().includes(term) ||
      b.category?.toLowerCase().includes(term)
    );

    this.expandedRows = {};
  }

  expandAll() {
    this.expandedRows = this.books.reduce((acc, book) => {
      acc[book._id] = true;
      return acc;
    }, {} as Record<string, boolean>);
  }

  collapseAll() {
    this.expandedRows = {};
  }

  onRowExpand(event: { data: Book }) {
    console.log('Expanded:', event.data);
  }

  onRowCollapse(event: { data: Book }) {
    console.log('Collapsed:', event.data);
  }

  openNew() {
    this.isEditMode = false;
    this.selectedBook = null;

    this.bookForm.reset({
      title: '',
      author: '',
      category: '',
      price: 0,
      description: ''
    });

    this.resetFormState();
    this.bookDialog = true;
  }

  editBook(book: Book) {
    this.isEditMode = true;
    this.selectedBook = book;

    this.bookForm.patchValue({
      title: book.title || '',
      author: book.author || '',
      category: book.category || '',
      price: book.price ?? 0,
      description: book.description || ''
    });

    this.resetFormState();
    this.bookDialog = true;
  }

  onImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => (this.previewImage = reader.result as string);
    reader.readAsDataURL(file);
  }

  toggleFeatured(book: Book) {
    this.bookService.updateFeatured(book._id, !book.featured).subscribe({
      next: (updated: Book) => {
        book.featured = updated.featured;
      },
      error: (err) => {
        console.error(err);
        alert('Failed to update featured status');
      }
    });
  }

  deleteBook(book: Book) {
    if (!confirm(`Delete book "${book.title}"?`)) return;

    this.bookService.deleteBook(book._id).subscribe({
      next: () => {
        this.books = this.books.filter((b) => b._id !== book._id);
        this.filteredBooks = this.filteredBooks.filter((b) => b._id !== book._id);
        delete this.expandedRows[book._id];
      },
      error: (err) => {
        console.error(err);
        alert('Failed to delete book');
      }
    });
  }

  saveBook() {
    if (this.bookForm.invalid) {
      this.bookForm.markAllAsTouched();
      return;
    }

    const { title, author, category, price, description } = this.bookForm.value;
    const fd = new FormData();

    fd.append('title', title || '');
    fd.append('author', author || '');
    fd.append('category', category || '');
    fd.append('description', description || '');
    fd.append('price', String(price ?? 0));

    if (this.selectedFile) {
      fd.append('image', this.selectedFile);
    }

    // UPDATE
    if (this.isEditMode && this.selectedBook) {
      this.bookService.updateBook(this.selectedBook._id, fd).subscribe({
        next: (updated: Book) => {
          const idx = this.books.findIndex(b => b._id === this.selectedBook!._id);
          if (idx !== -1) this.books[idx] = updated;

          this.resetFormState();
          this.bookForm.reset();
          this.bookDialog = false;
        },
        error: () => alert('Failed to update book')
      });
    }

    // CREATE
    else {
      this.bookService.createBook(fd).subscribe({
        next: (created: Book) => {
          this.books.unshift(created);
          this.filteredBooks = [...this.books];

          this.resetFormState();
          this.bookForm.reset();
          this.bookDialog = false;
        },
        error: () => alert('Failed to create book')
      });
    }
  }

  hideDialog() {
    this.resetFormState();
    this.bookForm.reset();
    this.bookDialog = false;
    this.isEditMode = false;
    this.selectedBook = null;
  }

  get f() {
    return this.bookForm.controls;
  }
}
