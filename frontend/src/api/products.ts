import type { ProductResponse, CreateProductDTO, PaginatedResponse, ApiError } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_BASE = `${BASE_URL}/api`;


class ApiClientError extends Error {
  statusCode: number;
  apiError: ApiError;

  constructor(statusCode: number, apiError: ApiError) {
    super(apiError.message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.apiError = apiError;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let error: ApiError;
    try {
      error = await response.json();
    } catch {
      error = {
        error: 'NETWORK_ERROR',
        message: `HTTP ${response.status}: ${response.statusText}`,
        statusCode: response.status,
      };
    }
    throw new ApiClientError(response.status, error);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  const data = await response.json();
  return data;
}

export async function fetchProducts(page = 1, limit = 20): Promise<PaginatedResponse<ProductResponse>> {
  const response = await fetch(`${API_BASE}/products?page=${page}&limit=${limit}`);
  return handleResponse<PaginatedResponse<ProductResponse>>(response);
}

export async function createProduct(data: CreateProductDTO): Promise<ProductResponse> {
  const response = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<ProductResponse>(response);
}

export async function deleteProduct(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<void>(response);
}

export async function fetchProduct(id: string): Promise<ProductResponse> {
  const response = await fetch(`${API_BASE}/products/${id}`);
  return handleResponse<ProductResponse>(response);
}

export { ApiClientError };
