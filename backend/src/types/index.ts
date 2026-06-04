export interface Product {
  id: string;
  url: string;
  name: string;
  initial_price: number;
  current_price: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PriceHistory {
  id: string;
  product_id: string;
  price: number;
  recorded_at: string;
}

export interface CreateProductDTO {
  url: string;
  name: string;
  price: number;
  currency?: string;
}

export interface ProductResponse {
  id: string;
  url: string;
  name: string;
  initialPrice: number;
  currentPrice: number;
  currency: string;
  priceChange: number;
  priceChangePercent: number;
  trend: 'up' | 'down' | 'stable';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
