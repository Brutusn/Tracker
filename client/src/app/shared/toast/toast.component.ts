import { Component } from '@angular/core';

import { Toast } from './toast.interface';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
})
export class ToastComponent {

  hasToast = false;
  toast: Toast;

  toastTimer = null;

  constructor (private ts: ToastService) {
    this.ts.toasts.subscribe((toast: Toast) => {
      this.hasToast = true;
      this.toast = toast;

      this.toastTimeout(toast.closeDelay);
    });
  }

  private toastTimeout (timeout: number) {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    this.toastTimer = setTimeout(() => {
      this.hasToast = false;
    }, timeout);
  }
}
