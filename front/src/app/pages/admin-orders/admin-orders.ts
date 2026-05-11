import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersService, Order } from 'src/app/services/orders.service';
import { ToastService } from 'src/app/services/toast.service';

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
  imports: [CommonModule],
  templateUrl: './admin-orders.html',
  styleUrls: ['./admin-orders.css']
})
export class AdminOrders implements OnInit {
  orders: Order[] = [];
  loading = false;
  filterStatus = 'all'; // Nuevo: estado del filtro

  constructor(
    private ordersService: OrdersService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.ordersService.getAllOrders()
      .subscribe({
        next: (res) => {
          console.log('PEDIDOS RECIBIDOS POR ADMIN:', res); // Log para depurar
          this.orders = res || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading orders:', err);
          this.loading = false;
          this.toastService.show('Error al cargar los pedidos');
        }
      });
  }

  setFilter(status: string): void {
    this.filterStatus = status;
  }

  getFilteredOrders(): Order[] {
    if (this.filterStatus === 'all') return this.orders;
    return this.orders.filter(o => o.status === this.filterStatus);
  }

  updateStatus(orderId: string, newStatus: string): void {
    this.ordersService.updateOrderStatus(orderId, newStatus)
      .subscribe({
        next: (updatedOrder) => {
          const order = this.orders.find(o => o.id === orderId);
          if (order) {
            order.status = updatedOrder.status;
            this.toastService.show(`Pedido #${order.id.slice(0, 8)} actualizado a ${this.getStatusLabel(newStatus)}`);
          }
        },
        error: (err) => {
          console.error('Error updating status:', err);
          this.toastService.show('Error al actualizar el estado del pedido');
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

