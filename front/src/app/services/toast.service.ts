import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  message: string;
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private _toasts$ = new Subject<Toast>();
  toasts$ = this._toasts$.asObservable();
  private counter = 0;

  show(message: string): void {
    this._toasts$.next({ message, id: ++this.counter });
  }
}
