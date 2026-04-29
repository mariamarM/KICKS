import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../services/products';
import { ToastService } from '../../services/toast.service';

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  brand?: string;
  sizes: string[];
  image_url?: string;
  category_id?: string;
  is_active: boolean;
  categories?: { name: string; slug: string };
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-products.html',
  styleUrls: ['./admin-products.css']
})
export class AdminProducts implements OnInit {
  products: Product[] = [];
  loading = false;

  // Panel de edición
  selectedProduct: Product | null = null;
  editForm = {
    name: '',
    description: '',
    price: '',
    stock: '',
    brand: '',
    sizes: '',
    category_id: '',
    image_url: ''
  };

  // Eliminación con swipe
  swipeState: Record<string, 'idle' | 'swiped'> = {};

  constructor(
    private productsService: ProductsService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productsService.getProducts({ limit: 100 }).subscribe({
      next: (res) => {
        this.products = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.toastService.show('Error al cargar productos');
        this.loading = false;
      }
    });
  }

  openEditPanel(product: Product): void {
    this.selectedProduct = product;
    this.editForm = {
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      stock: String(product.stock),
      brand: product.brand || '',
      sizes: (product.sizes || []).join(', '),
      category_id: product.category_id || '',
      image_url: product.image_url || ''
    };
  }

  closeEditPanel(): void {
    this.selectedProduct = null;
  }

  saveProduct(): void {
    if (!this.selectedProduct) return;

    const formData = new FormData();
    formData.append('name', this.editForm.name);
    formData.append('description', this.editForm.description);
    formData.append('price', this.editForm.price);
    formData.append('stock', this.editForm.stock);
    formData.append('brand', this.editForm.brand);
    formData.append('sizes', JSON.stringify(this.editForm.sizes.split(',').map((s: string) => s.trim()).filter(Boolean)));
    formData.append('category_id', this.editForm.category_id);
    if (this.editForm.image_url) {
      formData.append('image_url', this.editForm.image_url);
    }

    this.productsService.updateProduct(this.selectedProduct.id, formData).subscribe({
      next: (res) => {
        this.toastService.show('Producto actualizado correctamente');
        this.closeEditPanel();
        this.loadProducts();
      },
      error: (err) => {
        console.error('Error updating product:', err);
        this.toastService.show('Error al actualizar producto');
      }
    });
  }

  swipeToDelete(productId: string): void {
    this.swipeState = { ...this.swipeState, [productId]: 'swiped' };
  }

  cancelSwipe(productId: string): void {
    this.swipeState = { ...this.swipeState, [productId]: 'idle' };
  }

  confirmDelete(product: Product): void {
    this.productsService.deleteProduct(product.id).subscribe({
      next: () => {
        this.toastService.show(`Producto "${product.name}" eliminado`);
        this.cancelSwipe(product.id);
        this.loadProducts();
      },
      error: (err) => {
        console.error('Error deleting product:', err);
        this.toastService.show('Error al eliminar producto');
      }
    });
  }

  isSwipeVisible(productId: string): boolean {
    return this.swipeState[productId] === 'swiped';
  }
}
