export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  customerName: string;
  email: string;
  total: number;
  createdAt: Date;
  items: OrderItem[];
}
