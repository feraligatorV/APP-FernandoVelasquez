import { http } from "./http";
import type { CartSummary } from "../types/cart";
import type { Order } from "../types/order";

export const cartApi = {
  get: (token: string) => http<CartSummary>("/api/cart", { token }),

  add: (token: string, productId: number, quantity = 1) =>
    http<CartSummary>("/api/cart/items", {
      method: "POST",
      token,
      body: JSON.stringify({ productId, quantity })
    }),

  remove: (token: string, cartItemId: number) =>
    http<CartSummary>(`/api/cart/items/${cartItemId}`, { method: "DELETE", token }),

  checkout: (token: string) =>
    http<{ orderId: number }>("/api/cart/checkout", { method: "POST", token }),

  listOrders: (token: string) => http<Order[]>("/api/orders", { token })
};
