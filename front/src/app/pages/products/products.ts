import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { ProductsService } from '../../services/products';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  standalone: true,
  selector: 'app-products',
  imports: [CommonModule, RouterModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {

  products: any[] = [
    { name: 'Air Jordan 1', brand: 'Nike', price: 170, image_url: 'assets/kicks.png', slug: 'air-jordan-1' },
    { name: 'Yeezy Boost 350', brand: 'Adidas', price: 220, image_url: 'assets/kicks.png', slug: 'yeezy-350' },
    { name: 'New Balance 550', brand: 'New Balance', price: 120, image_url: 'assets/kicks.png', slug: 'nb-550' },
    { name: 'Forum Low', brand: 'Adidas', price: 100, image_url: 'assets/kicks.png', slug: 'forum-low' },
    { name: 'Dunk Low', brand: 'Nike', price: 110, image_url: 'assets/kicks.png', slug: 'dunk-low' },
    { name: 'Old Skool', brand: 'Vans', price: 75, image_url: 'assets/kicks.png', slug: 'old-skool' },
    { name: 'Chuck 70', brand: 'Converse', price: 90, image_url: 'assets/kicks.png', slug: 'chuck-70' },
    { name: 'Gazelle', brand: 'Adidas', price: 100, image_url: 'assets/kicks.png', slug: 'gazelle' }
  ];

  rotation: number = 0;
  activeIndex: number = 0;
  activeProduct: any = null;
  angleStep: number = 60;

  targetRotation: number = 0;
  isAnimating: boolean = false;
  constructor(private productsService: ProductsService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadProducts();
    this.updateActiveProduct();
  }

  loadProducts() {
    this.productsService.getProducts().subscribe({
      next: (res: any) => {
        if (res.data && res.data.length > 0) {
          this.products = res.data;
          this.angleStep = 360 / Math.max(this.products.length, 12); // Distribuir en el círculo
          this.updateActiveProduct();
        }
      },
      error: (err) => console.error('Error loading products:', err)
    });
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
