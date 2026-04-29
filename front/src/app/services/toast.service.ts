import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

<<<<<<< HEAD
export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
=======
export interface Toast {
  message: string;
  id: number;
  type?: 'success' | 'error' | 'info';
>>>>>>> feature-login
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
<<<<<<< HEAD
  private toastSubject = new Subject<ToastMessage>();
  toast$ = this.toastSubject.asObservable();

  show(message: string, type: 'success' | 'error' | 'info' = 'success', duration: number = 3000) {
    this.toastSubject.next({ message, type, duration });
=======
  private _toasts$ = new Subject<Toast>();
  toasts$ = this._toasts$.asObservable();
  private counter = 0;

  show(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    this._toasts$.next({ message, id: ++this.counter, type });
>>>>>>> feature-login
  }
}
