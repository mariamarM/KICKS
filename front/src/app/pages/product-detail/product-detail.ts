import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductsService } from '../../services/products';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit {

  product: any;

  constructor(
    private route: ActivatedRoute,
    private productsService: ProductsService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.productsService.getProductBySlug(id)
      .subscribe(res => {
        this.product = res;
      });
  }
}
