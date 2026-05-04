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

interface ProductForm {
  name: string;
  description: string;
  price: string;
  stock: string;
  brand: string;
  sizes: string;
  category_id: string;
  image_url: string;
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
  isCreating = false;
  searchTerm: string = '';
  expandedState: Record<string, boolean> = {};

  selectedProduct: Product | null = null;
  editForm: ProductForm = {
    name: '',
    description: '',
    price: '',
    stock: '',
    brand: '',
    sizes: '',
    category_id: '',
    image_url: ''
  };

  createForm: ProductForm = {
    name: '',
    description: '',
    price: '',
    stock: '',
    brand: '',
    sizes: '',
    category_id: '',
    image_url: ''
  };

  swipeState: Record<string, 'idle' | 'swiped'> = {};

  constructor(
    private productsService: ProductsService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  get filteredProducts(): Product[] {
    if (!this.searchTerm) return this.products;

    const term = this.searchTerm.toLowerCase();

    return this.products.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.brand?.toLowerCase().includes(term) ||
      p.categories?.name?.toLowerCase().includes(term)
    );
  }

  toggleCreate(): void {
    this.isCreating = !this.isCreating;
    this.selectedProduct = null;

    this.createForm = {
      name: '',
      description: '',
      price: '',
      stock: '',
      brand: '',
      sizes: '',
      category_id: '',
      image_url: ''
    };
  }

  selectProduct(product: Product): void {
    this.selectedProduct = product;
  }

  toggleExpand(id: string): void {
    this.expandedState[id] = !this.expandedState[id];
  }

  isExpanded(id: string): boolean {
    return !!this.expandedState[id];
  }

  loadProducts(): void {
    this.loading = true;
    this.productsService.getProducts({ limit: 100 }).subscribe({
      next: (res) => {
        this.products = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.toastService.show('Error al cargar productos');
        this.loading = false;
      }
    });
  }

  openEditPanel(product: Product): void {
    this.selectedProduct = product;

    this.editForm = {
      name: product.name || '',
      description: product.description || '',
      price: String(product.price ?? ''),
      stock: String(product.stock ?? ''),
      brand: product.brand || '',
      sizes: (product.sizes || []).join(', '),
      category_id: product.category_id || '',
      image_url: product.image_url || ''
    };
  }

  closeEditPanel(): void {
    this.selectedProduct = null;
  }

  private validateForm(form: ProductForm): boolean {
    if (!form.name.trim()) {
      this.toastService.show('El nombre es obligatorio');
      return false;
    }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
      this.toastService.show('El precio debe ser un número positivo');
      return false;
    }
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0) {
      this.toastService.show('El stock debe ser un número no negativo');
      return false;
    }
    if (!form.sizes.trim()) {
      this.toastService.show('Las tallas son obligatorias');
      return false;
    }
    return true;
  }

  saveProduct(): void {
    if (!this.selectedProduct) return;

    if (!this.validateForm(this.editForm)) return;

    const formData = new FormData();
    formData.append('name', this.editForm.name.trim());
    formData.append('description', this.editForm.description.trim());
    formData.append('price', String(Number(this.editForm.price)));
    formData.append('stock', String(Number(this.editForm.stock)));
    formData.append('brand', this.editForm.brand.trim());
    formData.append('sizes', JSON.stringify(
      this.editForm.sizes.split(',').map((s: string) => s.trim()).filter(Boolean)
    ));
    formData.append('category_id', this.editForm.category_id.trim());

    if (this.editForm.image_url) {
      formData.append('image_url', this.editForm.image_url.trim());
    }

    this.productsService.updateProduct(this.selectedProduct.id, formData).subscribe({
      next: () => {
        this.toastService.show('Producto actualizado');
        this.closeEditPanel();
        this.loadProducts();
      },
      error: () => {
        this.toastService.show('Error al actualizar producto');
      }
    });
  }

  confirmDelete(product: Product | null): void {
    if (!product) return;
    this.productsService.deleteProduct(product.id).subscribe({
      next: () => {
        this.toastService.show(`Producto eliminado`);
        this.loadProducts();
      }
    });
  }

  createProduct(): void {
    if (!this.validateForm(this.createForm)) return;

    const formData = new FormData();
    formData.append('name', this.createForm.name.trim());
    formData.append('description', this.createForm.description.trim());
    formData.append('price', String(Number(this.createForm.price)));
    formData.append('stock', String(Number(this.createForm.stock)));
    formData.append('brand', this.createForm.brand.trim());
    formData.append('sizes', JSON.stringify(
      this.createForm.sizes.split(',').map(s => s.trim()).filter(Boolean)
    ));
    formData.append('category_id', this.createForm.category_id.trim());
    formData.append('image_url', this.createForm.image_url.trim());
    formData.append('is_active', 'true');

    this.productsService.createProduct(formData).subscribe({
      next: () => {
        this.toastService.show('Producto creado');
        this.isCreating = false;
        this.loadProducts();
      },
      error: () => {
        this.toastService.show('Error al crear producto');
      }
    });
  }

}
