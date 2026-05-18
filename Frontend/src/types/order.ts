export interface OrderItem {
  productId: number;
  name: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: number;
  createdAt: string;
  totalAmount: number;
  items: OrderItem[];
}
