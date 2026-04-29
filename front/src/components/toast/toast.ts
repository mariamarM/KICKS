import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, Toast } from '../../app/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrls: ['./toast.css']
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: (Toast & { visible: boolean })[] = [];
  private sub!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.sub = this.toastService.toasts$.subscribe(toast => {
      const t = { ...toast, visible: true };
      this.toasts.push(t);

      // Ocultar tras 3s con animación de salida
      setTimeout(() => {
        t.visible = false;
        // Eliminar del array tras la animación de salida (300ms)
        setTimeout(() => {
          this.toasts = this.toasts.filter(x => x.id !== toast.id);
        }, 400);
      }, 3000);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  dismiss(id: number): void {
    const t = this.toasts.find(x => x.id === id);
    if (t) {
      t.visible = false;
      setTimeout(() => {
        this.toasts = this.toasts.filter(x => x.id !== id);
      }, 400);
    }
  }
}
