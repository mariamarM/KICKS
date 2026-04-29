import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private baseUrl = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) {}

  getProducts(params?: any) {
    return this.http.get<any>(this.baseUrl, { params });
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
