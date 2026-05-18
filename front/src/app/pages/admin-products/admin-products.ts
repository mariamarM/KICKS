import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductsService } from 'src/app/services/products';
import { ToastService } from 'src/app/services/toast.service';

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
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-products.html',
  styleUrls: ['./admin-products.css']
})
export class AdminProducts implements OnInit {
  products: Product[] = [];
  categories: { id: string; name: string }[] = [];
  loading = false;
  isCreating = false;
  searchTerm: string = '';
  expandedState: Record<string, boolean> = {};

  selectedProduct: Product | null = null;
  editForm!: FormGroup;
  createForm!: FormGroup;

  swipeState: Record<string, 'idle' | 'swiped'> = {};

  constructor(
    private productsService: ProductsService,
    private toastService: ToastService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initForms();
    this.loadProducts();
    this.loadCategories();
  }

  loadCategories(): void {
    this.productsService.getCategories().subscribe({
      next: (res: any) => {
        this.categories = Array.isArray(res) ? res : (res.data || []);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar categorías', err)
    });
  }

  initForms(): void {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      brand: [''],
      sizes: ['', Validators.required],
      category_id: [''],
      image_url: [''],
      is_active: [true]
    });

    this.createForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      brand: [''],
      sizes: ['', Validators.required],
      category_id: [''],
      image_url: [''],
      is_active: [true]
    });
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

    if (this.createForm) {
      this.createForm.reset({ is_active: true });
    }
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
        this.products = (Array.isArray(res.data) ? res.data : (res.data ? [res.data] : [])) as any;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.toastService.show('Error al cargar productos');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openEditPanel(product: Product): void {
    this.selectedProduct = product;

    if (this.editForm) {
      this.editForm.patchValue({
        name: product.name || '',
        description: product.description || '',
        price: product.price ?? '',
        stock: product.stock ?? '',
        brand: product.brand || '',
        sizes: (product.sizes || []).join(', '),
        category_id: product.category_id || '',
        image_url: product.image_url || '',
        is_active: product.is_active ?? true
      });
    }
  }

  closeEditPanel(): void {
    this.selectedProduct = null;
  }

  saveProduct(): void {
    if (!this.selectedProduct || this.editForm.invalid) return;

    const val = this.editForm.value;
    const formData = new FormData();
    formData.append('name', val.name.trim());
    formData.append('description', val.description?.trim() || '');
    formData.append('price', String(Number(val.price)));
    formData.append('stock', String(Number(val.stock)));
    formData.append('brand', val.brand?.trim() || '');

    const sizesArr = (val.sizes || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    formData.append('sizes', JSON.stringify(sizesArr));

    if (val.category_id?.trim()) {
      formData.append('category_id', val.category_id.trim());
    }

    if (val.image_url) {
      formData.append('image_url', val.image_url.trim());
    }

    formData.append('is_active', String(val.is_active));

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
    if (this.createForm.invalid) return;

    const val = this.createForm.value;
    const formData = new FormData();
    formData.append('name', val.name.trim());
    formData.append('description', val.description?.trim() || '');
    formData.append('price', String(Number(val.price)));
    formData.append('stock', String(Number(val.stock)));
    formData.append('brand', val.brand?.trim() || '');

    const sizesArr = (val.sizes || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    formData.append('sizes', JSON.stringify(sizesArr));

    if (val.category_id?.trim()) {
      formData.append('category_id', val.category_id.trim());
    }

    if (val.image_url) {
      formData.append('image_url', val.image_url.trim());
    }
    formData.append('is_active', 'true');

    this.productsService.createProduct(formData).subscribe({
      next: () => {
        this.toastService.show('Producto creado');
        this.isCreating = false;
        this.createForm.reset({ is_active: true });
        this.loadProducts();
      },
      error: (err) => {
        console.error('Error del servidor:', err);
        const errorMsg = err.error?.error || err.error?.message || err.message;
        this.toastService.show('Error: ' + errorMsg);
        this.cdr.detectChanges();
      }
    });
  }

}
