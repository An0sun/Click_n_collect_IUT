export type OrderStatus = 'PREPARATION' | 'PRET' | 'CONSOMEE';

export interface Order {
  id: number;
  customer_name: string;
  email: string;
  total: number;
  status : OrderStatus;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

export interface OrdersPage {
  items: Order[];
  page: number;
  per_page: number;
  total: number;
  pages: number;
}
