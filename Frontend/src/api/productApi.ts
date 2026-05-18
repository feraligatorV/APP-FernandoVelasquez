import { http } from "./http";
import type { Product } from "../types/product";

export const productApi = {
  list: () => http<Product[]>("/api/products")
};
