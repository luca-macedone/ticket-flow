import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  readonly toasts = signal<Toast[]>([])
  private nextId = 0;

  success(message: string, duration = 4000) { this._add('success', message, duration); }
  error(message: string, duration = 5000) { this._add('error', message, duration); }
  info(message: string, duration = 4000) { this._add('info', message, duration); }

  dismiss(id: number) { this.toasts.update(t => t.filter(x => x.id !== id)); }

  private _add(type: ToastType, message: string, duration: number) {
    const id = this.nextId++;
    this.toasts.update(t => [...t, { id, type, message }]);
    setTimeout(() => this.dismiss(id), duration)
  }
}
