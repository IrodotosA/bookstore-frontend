
export type OrderStatus = 'pending' | 'shipped' | 'completed' | 'canceled';
export type PaymentMethod = 'card' | 'cod' | 'paypal';

export interface Order {
  _id: string;

  items: OrderItem[];

  status: OrderStatus;
  paymentMethod: PaymentMethod;
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

  createdAt?: string;
  updatedAt?: string;
}


export interface OrderItem {
  title: string;
  quantity: number;
  price: number;
}
