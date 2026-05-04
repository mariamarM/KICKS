import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Products } from './pages/products/products';
import { ProductDetail } from './pages/product-detail/product-detail';
import { Cart } from './pages/cart/cart';
import { Orders } from './pages/orders/orders';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Profile } from './pages/profile/profile';
<<<<<<< HEAD
=======
import { AdminProducts } from './pages/admin-products/admin-products';
import { AdminOrders } from './pages/admin-orders/admin-orders';
>>>>>>> feature-admin

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'products', component: Products },
  { path: 'products/:id', component: ProductDetail },
  { path: 'cart', component: Cart },
  { path: 'orders', component: Orders },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'profile', component: Profile },
  { path: 'admin/products', component: AdminProducts },
  { path: 'admin/orders', component: AdminOrders },
  { path: '**', redirectTo: '' }
];
