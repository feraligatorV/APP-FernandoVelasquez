import type { Product } from "../types/product";

export interface GuestCartItem {
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
}

const GUEST_CART_KEY = "guest_cart";

export function getGuestCart(): GuestCartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as GuestCartItem[];
  } catch {
    return [];
  }
}

export function setGuestCart(items: GuestCartItem[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function clearGuestCart() {
  localStorage.removeItem(GUEST_CART_KEY);
}

export function addGuestItem(product: Product, quantity = 1) {
  const current = getGuestCart();
  const existing = current.find((i) => i.productId === product.id);
  if (existing) {
    existing.quantity = Math.min(99, existing.quantity + quantity);
  } else {
    current.push({
      productId: product.id,
      name: product.name,
      unitPrice: product.price,
      quantity
    });
  }
  setGuestCart(current);
}
