import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

<<<<<<< HEAD
export interface Toast {
  message: string;
  id: number;
  type?: 'success' | 'error' | 'info';
=======
export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
>>>>>>> feature-admin
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
<<<<<<< HEAD
  private _toasts$ = new Subject<Toast>();
  toasts$ = this._toasts$.asObservable();
  private counter = 0;

  show(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    this._toasts$.next({ message, id: ++this.counter, type });
=======
  private _toasts$ = new Subject<ToastMessage>();
  toasts$ = this._toasts$.asObservable();
  private counter = 0;

  show(message: string, type: 'success' | 'error' | 'info' = 'success', duration: number = 3000): void {
    this._toasts$.next({
      id: ++this.counter,
      message,
      type,
      duration
    });
>>>>>>> feature-admin
  }
}
