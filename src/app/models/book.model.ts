export interface Book {
  _id: string;
  title: string;
  author: string;
  category: string;
  price: number;
  description?: string;
  imageUrl?: string;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}