import { OrderItem } from './order.model';

export interface CreateOrderDto {
  items: OrderItem[];
  paymentMethod: string;
  totalPrice: number;

  billing: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
}
