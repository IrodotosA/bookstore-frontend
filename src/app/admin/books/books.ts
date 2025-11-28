import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../services/book.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-books',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    ToggleButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    DecimalPipe
  ],
  templateUrl: './books.html',
  styleUrl: './books.scss'
})
export class AdminBooks implements OnInit {
    private bookService = inject(BookService);
    apiUrl = environment.apiUrl;
    books: any[] = [];
    loading = true;
    selectedFile: File | null = null;
    previewImage: string | null = null;
    expandedRows: { [key: string]: boolean } = {};
    searchTerm: string = '';
    filteredBooks: any[] = [];

    // Dialog state
    bookDialog = false;
    isEditMode = false;
    selectedBook: any | null = null;

    // Simple form model
    form = {
        title: '',
        author: '',
        category: '',
        price: 0,
        description: ''
    };

    ngOnInit() {
        this.loadBooks();
    }

    loadBooks() {
        this.loading = true;
        this.bookService.getAllBooks().subscribe({
            next: (data) => {
            this.books = data;
            this.filteredBooks = data; // <- IMPORTANT
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

        // Clear the file input element if it exists
        const fileInput = document.getElementById("book-image-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
    }


    filterBooks() {
        const term = this.searchTerm.toLowerCase().trim();

        this.filteredBooks = this.books.filter(b => {
            const titleMatch = b.title?.toLowerCase().includes(term);
            const authorMatch = b.author?.toLowerCase().includes(term);
            const categoryMatch = b.category?.toLowerCase().includes(term);

            return titleMatch || authorMatch || categoryMatch;
        });

        // Reset expanded rows after filtering
        this.expandedRows = {};
    }

    expandAll() {
        this.expandedRows = this.books.reduce((acc, book) => {
            acc[book._id] = true;
            return acc;
        }, {} as { [key: string]: boolean });
    }

    collapseAll() {
        this.expandedRows = {};
    }

    onRowExpand(event: any) {
        console.log('Expanded:', event.data);
    }

    onRowCollapse(event: any) {
        console.log('Collapsed:', event.data);
    }

    openNew() {
        this.isEditMode = false;
        this.selectedBook = null;
        this.form = {
        title: '',
        author: '',
        category: '',
        price: 0,
        description: ''
        };

        this.resetFormState();
        this.bookDialog = true;
    }

    editBook(book: any) {
        this.isEditMode = true;
        this.selectedBook = book;
        this.form = {
        title: book.title,
        author: book.author || '',
        category: book.category || '',
        price: book.price,
        description: book.description
        };
        this.bookDialog = true;
    }

    onImageSelect(event: any) {
        const file = event.target.files?.[0];
        if (!file) return;

        this.selectedFile = file;

        // Live preview
        const reader = new FileReader();
        reader.onload = () => this.previewImage = reader.result as string;
        reader.readAsDataURL(file);
    }

    toggleFeatured(book: any) {
        this.bookService.updateFeatured(book._id, !book.featured).subscribe({
            next: (updated) => {
            book.featured = updated.featured;  // Update instantly in table
            },
            error: (err) => {
            console.error(err);
            alert('Failed to update featured status');
            }
        });
    }

    deleteBook(book: any) {
        if (!confirm(`Delete book "${book.title}"?`)) return;

        this.bookService.deleteBook(book._id).subscribe({
        next: () => {
            this.books = this.books.filter(b => b._id !== book._id);
            this.filteredBooks = this.filteredBooks.filter(b => b._id !== book._id);
            delete this.expandedRows[book._id];
        },
        error: (err) => {
            console.error(err);
            alert('Failed to delete book');
        }
        });
    }

    saveBook() {

        // --- Build FormData for file upload + text fields ---
        const fd = new FormData();

        fd.append("title", this.form.title);
        fd.append("author", this.form.author);
        fd.append("category", this.form.category);
        fd.append("description", this.form.description);
        fd.append("price", this.form.price.toString());

        // Only append image if user selected one
        if (this.selectedFile) {
            fd.append("image", this.selectedFile);
        }

        // ------------ UPDATE MODE ------------
        if (this.isEditMode && this.selectedBook) {
            this.bookService.updateBook(this.selectedBook._id, fd).subscribe({
                next: (updated) => {
                    const idx = this.books.findIndex(b => b._id === this.selectedBook!._id);
                    if (idx !== -1) this.books[idx] = updated;

                    this.resetFormState();
                    this.bookDialog = false;
                    this.selectedFile = null;
                },
                error: (err) => {
                    console.error(err);
                    alert('Failed to update book');
                }
            });
        }

        // ------------ CREATE MODE ------------
        else {
            this.bookService.createBook(fd).subscribe({
                next: (created) => {
                    this.books.unshift(created);
                    this.resetFormState();
                    this.bookDialog = false;
                    this.selectedFile = null;
                },
                error: (err) => {
                    console.error(err);
                    alert('Failed to create book');
                }
            });
        }
    }

    hideDialog() {
        this.resetFormState();
        this.bookDialog = false;
    }
}
