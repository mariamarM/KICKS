import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { ProductsService } from '../../services/products';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({
  standalone: true,
  selector: 'app-products',
  imports: [CommonModule, RouterModule, FormsModule], // 👈 Added FormsModule
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {

  products: any[] = [];

  rotation: number = 0;
  activeIndex: number = 0;
  activeProduct: any = null;
  angleStep: number = 40;

  targetRotation: number = 0;
  isAnimating: boolean = false;

  // Filtros
  searchQuery: string = '';
  selectedCategory: string = '';
  categories: any[] = [];
  constructor(private productsService: ProductsService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
    this.updateActiveProduct();
  }

  loadCategories() {
    this.productsService.getCategories().subscribe(res => {
      this.categories = res.data;
    });
  }

  loadProducts() {
    const params: any = {};
    if (this.searchQuery) params.search = this.searchQuery;
    if (this.selectedCategory) params.category = this.selectedCategory;

    this.productsService.getProducts(params).subscribe({
      next: (res: any) => {
        console.log('Products loaded from API:', res);
        if (res.data) {
          this.products = res.data.length > 0 ? res.data : this.products; // Fallback if empty but API works
          if (res.data.length > 0) {
            this.angleStep = 360 / Math.max(this.products.length, 12);
            this.activeIndex = 0; // Reset to first item
            this.rotation = 0;
            this.targetRotation = 0;
            this.updateActiveProduct();
          }
        }
      },
      error: (err) => console.error('Error loading products list:', err)
    });
  }

  onSearch() {
    this.loadProducts();
  }

  onCategoryChange(categorySlug: string) {
    this.selectedCategory = categorySlug;
    this.loadProducts();
  }

  private snapTimeout: any;


  onWheel(event: WheelEvent) {
    event.preventDefault();

    const sensitivity = 0.15; // más bajo = más suave

    this.targetRotation -= event.deltaY * sensitivity;

    this.startAnimation();
  }

  snapToIndex(index: number) {
    this.activeIndex = index;
    this.rotation = -(index * this.angleStep);
    this.updateActiveProduct();
  }

  setActive(index: number) {
    this.activeIndex = index;
    this.rotation = -(index * this.angleStep);
    // Hacer scroll a la posición correspondiente (500px por item)
    window.scrollTo({
      top: index * 500,
      behavior: 'smooth'
    });
    this.updateActiveProduct();
  }

  updateActiveProduct() {
    this.activeProduct = this.products[this.activeIndex];
    this.cdr.detectChanges();
  }
  startAnimation() {
    if (this.isAnimating) return;

    this.isAnimating = true;

    const animate = () => {
      const diff = this.targetRotation - this.rotation;

      this.rotation += diff * 0.08; // este número controla el rebote/suavizado

      this.updateActiveIndex();

      if (Math.abs(diff) > 0.1) {
        requestAnimationFrame(animate);
      } else {
        this.isAnimating = false;
        this.snapToClosest();
      }
    };

    requestAnimationFrame(animate);
  }

  updateActiveIndex() {
    // normalizamos la rotación para que funcione correctamente
    const normalized = this.rotation % (this.angleStep * this.products.length);

    // calculamos el índice más cercano
    let index = Math.round(Math.abs(normalized) / this.angleStep);
    index = index % this.products.length;

    if (index !== this.activeIndex) {
      this.activeIndex = index;
      this.updateActiveProduct();
    }
  }

  snapToClosest() {
    const normalized = this.rotation % (this.angleStep * this.products.length);
    const nearestIndex = Math.round(Math.abs(normalized) / this.angleStep) % this.products.length;
    this.targetRotation = -(nearestIndex * this.angleStep);
    this.rotation = this.targetRotation; // para que no se mueva de golpe
    this.activeIndex = nearestIndex;
    this.updateActiveProduct();
  }

}
