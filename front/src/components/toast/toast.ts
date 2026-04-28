import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../app/services/toast.service';
import { Subscription } from 'rxjs';

interface ActiveToast extends ToastMessage {
  id: number;
  fading?: boolean;
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css'
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: ActiveToast[] = [];
  private subscription: Subscription = new Subscription();
  private counter = 0;

  constructor(private toastService: ToastService) { }

  ngOnInit() {
    this.subscription = this.toastService.toast$.subscribe(toast => {
      this.addToast(toast);
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  addToast(toast: ToastMessage) {
    const id = this.counter++;
    const activeToast: ActiveToast = { ...toast, id };
    this.toasts.push(activeToast);

    setTimeout(() => {
      this.removeToast(activeToast);
    }, toast.duration || 3000);
  }

  removeToast(toast: ActiveToast) {
    toast.fading = true;
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== toast.id);
    }, 400);
  }
}
