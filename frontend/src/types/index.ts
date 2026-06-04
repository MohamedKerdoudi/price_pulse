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

export interface CreateProductDTO {
  url: string;
  name: string;
  price: number;
  currency?: string;
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
  details?: Array<{ field: string; message: string }>;
}
