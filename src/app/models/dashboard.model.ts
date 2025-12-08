export interface OrderStatusEntry {
  date: string;
  count: number;
}

export interface OrdersByStatus {
  pending: OrderStatusEntry[];
  shipped: OrderStatusEntry[];
  completed: OrderStatusEntry[];
  canceled: OrderStatusEntry[];
  [key: string]: OrderStatusEntry[]; // fallback for safety
}

export interface DashboardResponse {
  totalRevenueLast30Days: number;
  totalOrdersLast30Days: number;
  pendingOrders: number;
  totalUsers: number;
  totalBooks: number;
  ordersByStatus: OrdersByStatus;
}
