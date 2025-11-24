import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../services/book.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  books: any[] = [];

  private bookService = inject(BookService);

  ngOnInit() {
    this.bookService.getLatestBooks(6).subscribe({
      next: (data) => {
        this.books = data;
      }
    });
  }
}