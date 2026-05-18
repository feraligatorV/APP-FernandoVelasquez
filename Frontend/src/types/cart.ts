export interface CartItem {
  id: number;
  productId: number;
  name: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface CartSummary {
  items: CartItem[];
  totalAmount: number;
}
