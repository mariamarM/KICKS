import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock_quantity: number;
  brand?: string;
  sizes: string[];
  image_url?: string;
  category_id?: string;
  is_active: boolean;
  rating?: number;
  total_reviews?: number;
  created_at?: string;
  updated_at?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ProductResponse {
  data: Product[] | Product;
  message?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoriesResponse {
  data: Category[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private baseUrl = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) {}

  getProducts(params?: any): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(this.baseUrl, { params });
  }

  getProductBySlug(slug: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.baseUrl}/${slug}`);
  }

  getProductById(id: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.baseUrl}/${id}`);
  }

  createProduct(productData: FormData): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(this.baseUrl, productData);
  }

  updateProduct(id: string, productData: FormData): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.baseUrl}/${id}`, productData);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }

  getCategories(): Observable<CategoriesResponse> {
    return this.http.get<CategoriesResponse>('http://localhost:3000/api/categories');
  }
}

  getProductBySlug(slug: string) {
    return this.http.get<any>(`${this.baseUrl}/${slug}`);
  }

  getProductById(id: string) {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  createProduct(productData: FormData) {
    return this.http.post<any>(this.baseUrl, productData);
  }

  updateProduct(id: string, productData: FormData) {
    return this.http.put<any>(`${this.baseUrl}/${id}`, productData);
  }

  deleteProduct(id: string) {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }

  getCategories() {
    return this.http.get<any>('http://localhost:3000/api/categories');
  }
}
