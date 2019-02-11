import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

import { Toast } from './toast.interface';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<Toast>();
  toasts = this.toastSubject.asObservable();

  private defaults: Toast = {
    message: '',
    style: 'normal',
    title: '',
    closeDelay: 3000
  };

  constructor() { }

  open (options: Toast) {
    const opts = { ...this.defaults, ...options };

    this.toastSubject.next(opts);
  }

  // Wrappers..
  error (message: string) {
    this.open({
      message,
      style: 'error'
    });
  }
  info (message: string) {
    this.open({
      message,
      style: 'info'
    });
  }
  success (message: string) {
    this.open({
      message,
      style: 'success'
    });
  }
  normal (message: string) {
    this.open({ message });
  }
}
