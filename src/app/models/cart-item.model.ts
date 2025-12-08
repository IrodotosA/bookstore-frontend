export interface CartItem {
  _id: string;
  title: string;
  author: string;
  category: string;
  price: number;
  description?: string;
  imageUrl?: string;
  featured?: boolean;

  quantity: number;

  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}