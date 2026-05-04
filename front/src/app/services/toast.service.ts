import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;

}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private _toasts$ = new Subject<ToastMessage>();
  toasts$ = this._toasts$.asObservable();
  private counter = 0;

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success', duration: number = 3000): void {
    this._toasts$.next({
      id: ++this.counter,
      message,
      type,
      duration
    });
  }
}
