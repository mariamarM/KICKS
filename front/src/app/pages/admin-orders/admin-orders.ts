import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  size?: string;
  products: {
    name: string;
    image_url?: string;
    brand?: string;
  };
}

interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address?: string;
  notes?: string;
  created_at: string;
  order_items: OrderItem[];
  users?: {
    email: string;
    full_name?: string;
  };
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#ffc107',
  confirmed: '#2196f3',
  shipped: '#9c27b0',
  delivered: '#4caf50',
  cancelled: '#f44336'
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado'
};

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './admin-orders.html',
  styleUrls: ['./admin-orders.css']
})
export class AdminOrders implements OnInit {
  orders: Order[] = [];
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.http.get<any[]>('http://localhost:3000/api/orders')
      .subscribe({
        next: (res) => {
          this.orders = res || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading orders:', err);
          this.loading = false;
        }
      });
  }

  updateStatus(orderId: string, newStatus: string): void {
    this.http.patch(`http://localhost:3000/api/orders/${orderId}/status`, { status: newStatus })
      .subscribe({
        next: () => {
          const order = this.orders.find(o => o.id === orderId);
          if (order) {
            order.status = newStatus as Order['status'];
          }
        },
        error: (err) => {
          console.error('Error updating status:', err);
        }
      });
  }

  getStatusColor(status: string): string {
    return STATUS_COLORS[status] || '#888';
  }

  getStatusLabel(status: string): string {
    return STATUS_LABELS[status] || status;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
